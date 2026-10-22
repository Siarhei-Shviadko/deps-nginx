ARG REPOSITORY_URL=""
FROM ${REPOSITORY_URL:+$REPOSITORY_URL/base/}nginx:1.31.7

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apt-utils \
        autoconf \
        automake \
        build-essential \
        git \
        libcurl4-openssl-dev \
        libgeoip-dev \
        liblmdb-dev \
        libpcre2-dev \
        libtool \
        libxml2-dev \
        libyajl-dev \
        pkgconf \
        wget \
        zlib1g-dev \
        ca-certificates \
        curl \
        gnupg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    git clone https://github.com/owasp-modsecurity/ModSecurity --branch v3.0.17 --depth 1 && \
    cd ModSecurity && \
    git submodule update --init --recursive && \
    ./build.sh && \
    ./configure && \
    make && \
    make install && \
    strip /usr/local/modsecurity/lib/lib*.so* && \
    git clone --depth 1 --branch v1.0.4 https://github.com/owasp-modsecurity/ModSecurity-nginx.git && \
    curl -sSL https://nginx.org/download/nginx-1.31.7.tar.gz -o nginx-1.31.7.tar.gz && \
    tar -xzf nginx-1.31.7.tar.gz && \
    cd ./nginx-1.31.7 && \
    ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
    make modules && \
    strip objs/ngx_http_modsecurity_module.so && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/ && \
    mkdir /etc/nginx/modsecurity && \
    curl -sSL https://raw.githubusercontent.com/owasp-modsecurity/ModSecurity/v3/master/modsecurity.conf-recommended \
         -o /etc/nginx/modsecurity/modsecurity.conf && \
    curl -sSL https://raw.githubusercontent.com/owasp-modsecurity/ModSecurity/v3/master/unicode.mapping \
         -o /etc/nginx/modsecurity/unicode.mapping && \
    sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsecurity/modsecurity.conf && \
    mkdir /etc/nginx/modsecurity/owasp-crs && \
    curl -SL https://github.com/coreruleset/coreruleset/archive/v3.3.2.tar.gz -o v3.3.2.tar.gz && \
    curl -SL https://github.com/coreruleset/coreruleset/releases/download/v3.3.2/coreruleset-3.3.2.tar.gz.asc -o coreruleset-3.3.2.tar.gz.asc && \
    gpg --fetch-key https://coreruleset.org/security.asc && \
    gpg --verify coreruleset-3.3.2.tar.gz.asc v3.3.2.tar.gz && \
    tar -zxf v3.3.2.tar.gz --strip-components=1 -C /etc/nginx/modsecurity/owasp-crs && \
    rm -f v3.3.2.tar.gz coreruleset-3.3.2.tar.gz.asc && \
    mv -v /etc/nginx/modsecurity/owasp-crs/crs-setup.conf.example /etc/nginx/modsecurity/owasp-crs/crs-setup.conf

COPY ./etc/nginx.conf /etc/nginx/nginx.conf
COPY ./templates /etc/nginx/templates/
COPY ./scripts /etc/nginx/scripts
COPY ./modsecurity/setup.conf /etc/nginx/modsecurity/setup.conf
COPY ./templates/conf/pages /usr/share/nginx/html
RUN mkdir /etc/nginx/ssl \
    && openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048 \
    && chmod 400 /etc/nginx/ssl/dhparam.pem

RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx /etc/nginx && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx /etc/nginx && \
    useradd -Ms /bin/bash deps

USER deps
