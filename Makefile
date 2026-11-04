PY := .venv/bin/python -I
LINES := 新宿駅南口改札・左側通行|0123456789 TOKYU

.PHONY: all font web samples images test venv

all: font web samples

venv:
	uv venv .venv && uv pip install -p .venv -r requirements.txt

font:
	$(PY) src/tape.py

web:
	$(PY) src/export_web.py

samples: font web
	$(PY) src/sample.py build/hand.ttf build/hand.png "$(LINES)"
	node web/cli.js "$(LINES)" build/engine_sample.json
	$(PY) src/raster_web.py build/engine_sample.json build/engine_sample.png

images:
	$(PY) src/showcase.py

test:
	node --test tests/*.test.mjs
	$(PY) -m unittest discover -s tests
