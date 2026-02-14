ZIP = reddit-cleaner-extension.zip

build:
	zip -r $(ZIP) manifest.json content.js popup.html popup.js icons/

clean:
	rm -f $(ZIP)

release:
ifndef v
	$(error "Please specify a version number. Example: make release v=0.1.0")
endif
	make build
	gh release create v$(v) $(ZIP) --generate-notes --target master
	make clean
