FROM nginx:alpine
# Copiamos el CONTENIDO de browser (donde está el index.html real) a la raíz
COPY dist/frontend/browser/ /usr/share/nginx/html/
RUN mkdir -p /usr/share/nginx/html/public
EXPOSE 80