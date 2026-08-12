PYTHON ?= /home/codespace/.python/current/bin/python
ARGS ?=

.PHONY: onda14 onda15 global-market

onda14:
	$(PYTHON) runtime/run_civilization_social_simulation.py $(ARGS)

onda15:
	$(PYTHON) runtime/run_earth_market_adoption_simulation.py $(ARGS)

global-market:
	$(PYTHON) runtime/global_market_runtime.py $(ARGS)
