package com.router.api.utils;

public enum ModuleConstants {
	ROUTER_MODULE("router"), ROUTER_CONTEXT_PATH("/router"),

	USER_MODULE("user"),

	MESSAGE_MANAGER_MODULE("message-manager"),

	MESSAGE_SEND_MODULE("message-send"),

	PATH_EXECUTOR("patch-executor"),

	MAIN_API_MODULE("main-api");
	private String name;

	ModuleConstants(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

}
