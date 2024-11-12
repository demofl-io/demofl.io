install:
	curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh
	sudo bash /tmp/nodesource_setup.sh
	sudo apt update
	sudo apt install nodejs
	curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
	chmod +x tailwindcss-linux-x64
	mv tailwindcss-linux-x64 tailwindcss
	npm i -D daisyui@latest

zip:
	zip -r demoflio-extension.zip manifest.json html/ dist/ demos/ pictures/ assets/ -x "assets/data.json"

tag:
	@DATE=$$(date +%Y.%m.%d); \
	LAST_TAG=$$(git tag -l "v$$DATE.*" | sort -V | tail -n 1); \
	if [ -z "$$LAST_TAG" ]; then \
		NEW_TAG="v$$DATE.001"; \
	else \
		LAST_NUM=$$(echo "$$LAST_TAG" | grep -o '[0-9]\{3\}$$' || echo "000"); \
		NEXT_NUM=$$(expr $$LAST_NUM + 1 2>/dev/null); \
		NEW_TAG="v$$DATE.$$(printf '%03d' $$NEXT_NUM)"; \
	fi; \
	if [ -n "$$NEW_TAG" ]; then \
		git tag "$$NEW_TAG" && echo "Created tag: $$NEW_TAG"; \
		git push origin "$$NEW_TAG"; \
	else \
		echo "Error: Failed to generate tag" >&2; \
		exit 1; \
	fi

