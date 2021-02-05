#! /bin/bash

SECONDS=0
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
echo $PWD

printf '\nMaking copy of live site\n'
cp -a /srv/www/saal.ee/. /srv/www-bak/`date +"%Y-%m-%d_%H-%M-%S"`/

FILECOUNT="$(ls /srv/ssg/build -a | wc -l)"
if [ $FILECOUNT -gt 4 ]
then
	printf '\n== Replacing live site ==\n'
	rsync -avh /srv/ssg/build/. /srv/www/saal.ee/  --delete-after
else
	printf '\n== Check build directory, something went wrong ==\n'
fi
