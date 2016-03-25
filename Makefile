all: retina

dist: all optimize

icons:
	#convert images/TrayIcon.png -define icon:auto-resize="128,96,64,48,32,16" -colors 256 tray.ico

retina:
	chmod +x retinize.sh
	./retinize.sh

optimize:
	imageoptim -d images -q
