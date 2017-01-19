####################################################################
# Working config file building an "all-in one" (and heavy..)
# image of the app and making it accessible on port 9999
# (but it should be splited in multiple containers).
# Configured in order to avoid using cache when fetching the code of the
# application and the code of smoomapy (stewart) package.
####################################################################
# Can be build like this :
#
# $ docker build -t "magrit_app:latest" --build-arg CACHEBUST=$(date +%s) .
#
#
# App can be started like this (exposing port 9999 in the host):
#
# $ docker run --publish "9999:9999" -it "magrit_app:latest"
#
#
# Access to a shell in the container can be obtained with a command like :
#
# $ docker run -it --entrypoint=/bin/bash "magrit_app:latest"
#


FROM ubuntu:latest
MAINTAINER mth

RUN apt-get update && apt-get install -y gcc libpython3.5-dev libopenblas-dev libopenblas-base \
        python3.5 python3.5-dev nodejs python3-pip gdal-bin libgdal-dev \
        libfreetype6-dev libfreetype6 libproj-dev libspatialindex-dev libv8-3.14-dev libffi-dev \
        nodejs nodejs-dev node-gyp npm redis-server libuv1-dev git wget \
		libxslt1-dev libxml2 libxml2-dev \
        && npm -g install topojson \
        && rm -rf /var/lib/apt/lists/* \
        && ln -s /usr/bin/nodejs /usr/bin/node

WORKDIR /home

ENV GDALINST /home/gdalinstall
ENV GDALBUILD /home/gdalbuild
ENV GDALOPTS="  --with-geos \
		        --with-expat \
		        --without-libtool \
		        --without-gif \
		        --without-pg \
		        --without-grass \
		        --without-libgrass \
		        --without-cfitsio \
		        --without-pcraster \
		        --without-netcdf \
		        --without-gif \
		        --without-ogdi \
		        --without-fme \
		        --without-hdf4 \
		        --with-spatialite \
		        --with-static-proj4=/usr/lib"

RUN mkdir $GDALBUILD && mkdir $GDALINST && cd $GDALBUILD && wget http://download.osgeo.org/gdal/2.1.2/gdal-2.1.2.tar.gz \
    && tar -xzf gdal-2.1.2.tar.gz && cd gdal-2.1.2 && ./configure --prefix=$GDALINST/gdal-2.1.2 $GDALOPTS \
	&& make -s -j 2 && make install

ENV PATH="${GDALINST}/gdal-2.1.2/bin:${PATH}"
ENV LD_LIBRARY_PATH="${GDALINST}/gdal-2.1.2/lib:${LD_LIBRARY_PATH}"

ARG CACHEBUST=1

RUN  mkdir /home/app && cd /home/app \
		&& git clone http://github.com/mthh/magrit/ \
        && cd magrit/ \
        && pip3 install -U -r requirements-dev.txt \
        && python3 setup.py install

RUN cd /home/app && git clone http://github.com/mthh/smoomapy/ \
        && cd smoomapy/ && python3 setup.py install && cd /home/app \
        && cp /usr/local/lib/python3.5/dist-packages/magrit_app-0.0.0-py3.5-linux-x86_64.egg/magrit_app/helpers/*.so /home/app/magrit/magrit_app/helpers/

EXPOSE 9999

CMD service redis-server start \
    && gunicorn "magrit_app.app:create_app()" --bind 0.0.0.0:9999 --worker-class aiohttp.worker.GunicornUVLoopWebWorker --workers 2 --chdir /home/app/magrit/