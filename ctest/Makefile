include ../sqlite-download.mk

include ../sqlite-build.mk

include ../sqlite-crypto-build.mk

all:
	echo 'all not supported' && exit 1

test: $(SQLITE_AMALGAMATION)/sqlite3.c testclean
	cc ctest_all.c $(SQLITE_CFLAGS) $(SQLITE_CRYPTO_CFLAGS) -I$(SQLITE_AMALGAMATION) -I.. -o test.out
	./test.out

$(SQLITE_AMALGAMATION)/sqlite3.c:
	curl -O $(SQLITE_ZIP_URL)
	unzip $(SQLITE_ZIP)

testclean:
	rm -rf test*.db

clean: testclean
	rm -rf *.out

distclean: clean
	rm -rf sqlite-*
