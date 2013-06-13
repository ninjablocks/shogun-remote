#!/bin/sh
echo "Don't run this on Java 7. Java 6 only."
echo "And don't use 'Distribute - Android App Store'. Run on 'Android Device' then run this."
jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1  -storepass **STORE PASSWORD** -keystore "NB Android Keystore" -signedjar Remote-signed.apk ../build/android/bin/app-unsigned.apk "ninjablocks android key"
zipalign -f -v 4 Remote-signed.apk Remote.apk
jarsigner -verify -verbose -certs Remote.apk