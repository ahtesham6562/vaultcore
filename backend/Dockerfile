# Stage 1: Build
FROM maven:3.9.14-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S vaultcore && adduser -S vaultcore -G vaultcore
COPY --from=builder /app/target/*.jar app.jar
RUN chown vaultcore:vaultcore app.jar
USER vaultcore
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseZGC", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]