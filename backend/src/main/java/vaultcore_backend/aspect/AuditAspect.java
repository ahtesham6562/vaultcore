package vaultcore_backend.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Around("execution(* vaultcore_backend.service.*.*(..))")
    public Object logMethod(ProceedingJoinPoint joinPoint) throws Throwable {

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        log.info("▶ [{}.{}] called", className, methodName);

        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long timeTaken = System.currentTimeMillis() - start;
            log.info("✅ [{}.{}] completed in {}ms", className, methodName, timeTaken);
            return result;

        } catch (Exception e) {
            log.error("❌ [{}.{}] FAILED — {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}