from __future__ import annotations

from collections.abc import Iterable


CATEGORY_COST_RATIO = {
    "obra": 0.53,
    "construction": 0.53,
    "iot": 0.50,
    "john_ai": 0.20,
    "ai": 0.20,
    "observability": 0.35,
    "facilities": 0.46,
    "default": 0.58,
}

PROFILE_RISK = {
    "enterprise": 0.16,
    "midmarket": 0.24,
    "smb": 0.31,
    "public": 0.28,
}

REGIONAL_INDEX = {
    "br-sp": 1.0,
    "br-rj": 1.02,
    "br-mg": 0.98,
    "br-ne": 0.95,
    "br-sul": 1.01,
}

PRICING_HISTORY = {
    "condominio-inteligente": [
        {"date": "2026-03-05", "price": 2190000, "margin": 0.418},
        {"date": "2026-04-10", "price": 2260000, "margin": 0.425},
        {"date": "2026-05-02", "price": 2235200, "margin": 0.432},
    ],
    "john-ai": [
        {"date": "2026-03-15", "price": 76000, "margin": 0.61},
        {"date": "2026-04-18", "price": 80000, "margin": 0.64},
    ],
}


def _round_money(value: float) -> float:
    return round(value, 2)


def _normalize_category(category: str | None, name: str) -> str:
    base_value = (category or name or "default").strip().lower().replace(" ", "_")
    if "john" in base_value:
        return "john_ai"
    if "obra" in base_value or "construction" in base_value:
        return "obra"
    if "observ" in base_value:
        return "observability"
    if "facility" in base_value:
        return "facilities"
    if "iot" in base_value:
        return "iot"
    return base_value if base_value in CATEGORY_COST_RATIO else "default"


def _bundle_discount(total_components: int) -> float:
    if total_components >= 5:
        return 0.12
    if total_components >= 3:
        return 0.08
    if total_components >= 2:
        return 0.04
    return 0.0


def _risk_label(risk_score: float) -> str:
    if risk_score < 0.25:
        return "baixo"
    if risk_score < 0.45:
        return "medio"
    return "alto"


def _build_john_decisions(margin: float, risk_label: str, discount: float, elasticity: float) -> list[str]:
    decisions: list[str] = []
    if discount > 0:
        decisions.append("ativar_desconto")
    if margin < 0.32:
        decisions.append("proteger_margem")
    if margin >= 0.40 and elasticity >= 0.55:
        decisions.append("sugerir_upsell")
    if risk_label == "alto":
        decisions.append("aprovar_negociacao_com_restricao")
    elif risk_label == "baixo" and margin >= 0.35:
        decisions.append("aprovar_negociacao")
    return decisions


def calculate_price(
    *,
    bundle_id: str,
    components: Iterable[dict],
    region: str = "br-sp",
    customer_profile: str = "enterprise",
    financing_months: int = 0,
    demand_index: float = 1.0,
) -> dict:
    normalized_components = []
    total_cost = 0.0
    base_price = 0.0

    for component in components:
        amount = float(component.get("amount", 0))
        quantity = int(component.get("quantity", 1) or 1)
        category = _normalize_category(component.get("category"), component.get("name", ""))
        price = amount * quantity
        cost_ratio = CATEGORY_COST_RATIO.get(category, CATEGORY_COST_RATIO["default"])
        estimated_cost = price * cost_ratio
        normalized_components.append(
            {
                "name": component.get("name", category),
                "category": category,
                "quantity": quantity,
                "amount": _round_money(price),
                "estimated_cost": _round_money(estimated_cost),
            }
        )
        base_price += price
        total_cost += estimated_cost

    regional_factor = REGIONAL_INDEX.get(region, 1.0)
    adjusted_price = base_price * regional_factor
    discount = _bundle_discount(len(normalized_components))
    final_price = adjusted_price * (1 - discount)
    margin = 0.0 if final_price <= 0 else (final_price - total_cost) / final_price

    profile_risk = PROFILE_RISK.get(customer_profile.lower(), 0.27)
    financing_risk = min(financing_months / 240, 0.18)
    price_pressure = max(0.0, (discount - 0.1) * 0.5)
    demand_pressure = 0.0 if demand_index >= 1 else min((1 - demand_index) * 0.2, 0.1)
    risk_score = min(profile_risk + financing_risk + price_pressure + demand_pressure, 0.95)
    risk_label = _risk_label(risk_score)

    elasticity = round(max(0.1, min(0.9, 0.48 + ((1.1 - demand_index) * 0.35))), 2)
    john_decisions = _build_john_decisions(margin, risk_label, discount, elasticity)

    return {
        "bundle_id": bundle_id,
        "components": normalized_components,
        "base_price": _round_money(base_price),
        "regional_factor": regional_factor,
        "discount": round(discount, 4),
        "final_price": _round_money(final_price),
        "estimated_cost": _round_money(total_cost),
        "gross_profit": _round_money(final_price - total_cost),
        "margin": round(margin, 4),
        "margin_percent": round(margin * 100, 1),
        "risk_score": round(risk_score, 4),
        "risk_label": risk_label,
        "elasticity_score": elasticity,
        "john_decisions": john_decisions,
        "currency": "BRL",
    }


def simulate_price(payload: dict) -> dict:
    base = calculate_price(
        bundle_id=payload["bundle_id"],
        components=payload["components"],
        region=payload.get("region", "br-sp"),
        customer_profile=payload.get("customer_profile", "enterprise"),
        financing_months=payload.get("financing_months", 0),
        demand_index=payload.get("demand_index", 1.0),
    )
    volatility = float(payload.get("market_volatility", 0.06))
    conservative = _round_money(base["final_price"] * (1 - volatility))
    aggressive = _round_money(base["final_price"] * (1 + volatility * 0.8))

    return {
        "bundle_id": base["bundle_id"],
        "recommended_price": base["final_price"],
        "scenarios": {
            "conservative": conservative,
            "base": base["final_price"],
            "aggressive": aggressive,
        },
        "margin_percent": base["margin_percent"],
        "risk_label": base["risk_label"],
    }


def build_bundle_offer(payload: dict) -> dict:
    price_snapshot = calculate_price(
        bundle_id=payload["bundle_id"],
        components=payload["components"],
        region=payload.get("region", "br-sp"),
        customer_profile=payload.get("customer_profile", "enterprise"),
        financing_months=payload.get("financing_months", 0),
        demand_index=payload.get("demand_index", 1.0),
    )
    return {
        "bundle_id": payload["bundle_id"],
        "offer_type": "smart_bundle",
        "products": [component["name"] for component in price_snapshot["components"]],
        "bundle_discount": price_snapshot["discount"],
        "final_price": price_snapshot["final_price"],
        "margin_percent": price_snapshot["margin_percent"],
        "john_recommendation": price_snapshot["john_decisions"],
    }


def check_discount(payload: dict) -> dict:
    customer_profile = payload.get("customer_profile", "enterprise").lower()
    requested_discount = float(payload.get("requested_discount", 0))
    limit = {
        "enterprise": 0.15,
        "midmarket": 0.12,
        "smb": 0.08,
        "public": 0.10,
    }.get(customer_profile, 0.1)

    current_margin = float(payload.get("current_margin", 0.35))
    projected_margin = current_margin - requested_discount
    approved = requested_discount <= limit and projected_margin >= 0.18

    return {
        "approved": approved,
        "requested_discount": requested_discount,
        "max_discount": limit,
        "projected_margin": round(projected_margin, 4),
        "reason": "within_policy" if approved else "discount_limit_or_margin_violation",
    }


def get_price_history(product: str) -> dict:
    history = PRICING_HISTORY.get(product, [])
    return {
        "product": product,
        "history": history,
        "total": len(history),
    }


def get_market_snapshot() -> dict:
    return {
        "currency": "BRL",
        "competitors": [
            {"name": "Mercado A", "index": 1.04, "pressure": "media"},
            {"name": "Mercado B", "index": 0.98, "pressure": "baixa"},
        ],
        "regional_index": REGIONAL_INDEX,
        "pricing_temperature": "disciplinado",
    }


def forecast_pricing(payload: dict) -> dict:
    expected_volume = int(payload.get("expected_volume", 1))
    target_price = float(payload.get("target_price", 0))
    expected_margin = float(payload.get("expected_margin", 0.3))
    forecast_revenue = target_price * expected_volume
    forecast_profit = forecast_revenue * expected_margin
    return {
        "forecast_revenue": _round_money(forecast_revenue),
        "forecast_profit": _round_money(forecast_profit),
        "expected_margin": round(expected_margin, 4),
        "expected_volume": expected_volume,
    }