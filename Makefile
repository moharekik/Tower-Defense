
all: build

build:
	npm run build
run:
	npm run start
test:
	npx jest --coverage

eslint:
	npm run eslint
parcel:
	npm run parcel
clean:
	rm -f *~
	rm -f dist/*
	rm -f .parcel-cache/*
