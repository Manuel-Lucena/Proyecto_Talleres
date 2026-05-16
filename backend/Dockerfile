# 1. Imagen base
FROM eclipse-temurin:17-jdk-alpine

# 2. Carpetas para el disco compartido
RUN mkdir -p /app/data/public /app/data/protected

# 3. El COPY corregido (con asterisco para que encuentre el JAR)
COPY target/*.jar app.jar

# 4. Arranque
ENTRYPOINT ["java", "-jar", "/app.jar"]