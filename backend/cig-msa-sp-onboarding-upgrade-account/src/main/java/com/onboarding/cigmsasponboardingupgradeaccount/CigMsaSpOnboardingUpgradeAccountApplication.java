package com.onboarding.cigmsasponboardingupgradeaccount;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CigMsaSpOnboardingUpgradeAccountApplication {

	public static void main(String[] args) {
		SpringApplication.run(CigMsaSpOnboardingUpgradeAccountApplication.class, args);
	}

}
