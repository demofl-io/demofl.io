

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
	zip -r demoflio-extension.zip manifest.json html/ dist/ demos/ pictures/ assets/ 