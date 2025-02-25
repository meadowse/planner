FROM node as build
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && mv node_modules ../
COPY . .
ENTRYPOINT ["nginx", "-g", "daemon off;"]
#RUN npm run build
#
#FROM nginx
#RUN useradd meadowse; \
#    chown -R meadowse:meadowse /home; \
#    chown -R meadowse:meadowse /etc/nginx/conf.d; \
#    chown -R meadowse:meadowse /usr/share/nginx/html; \
#    chown -R meadowse:meadowse /var/cache/nginx; \
#    touch /var/run/nginx.pid; \
#    chown -R meadowse:meadowse /var/run/nginx.pid; \
#    chmod g-s /usr/sbin/unix_chkpwd; \
#    chmod g-s /usr/bin/expiry; \
#    chmod g-s /usr/bin/chage; \
#    chmod u-s /usr/bin/umount; \
#    chmod u-s /usr/bin/mount; \
#    chmod u-s /usr/bin/chfn; \
#    chmod u-s /usr/bin/chsh; \
#    chmod u-s /usr/bin/newgrp; \
#    chmod u-s /usr/bin/gpasswd; \
#    chmod u-s /usr/bin/passwd; \
#    chmod u-s /usr/bin/su
#COPY --from=build /usr/src/app/build /usr/share/nginx/html
#COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/nginx.conf
#EXPOSE 80
#USER meadowse
#ENTRYPOINT ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]
#HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost || exit 1