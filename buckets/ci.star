load(
    "//lib/builders.star",
    "builder",
    "builder_descriptor",
    "config_section",
    "default_timeout",
    "defaults",
    "dimensions",
    "generate_ci_configs",
)
load("//definitions.star", "versions")

defaults.build_numbers.set(True)

def branch_section(name):
    return config_section(
        name = name,
        branch = "refs/heads/chromium/%s" % versions[name],
        notifiers = ["devtools notifier"],
        priority = 50,
    )

generate_ci_configs(
    configurations = [
        config_section(
            name = "ci",
            branch = "refs/heads/main",
            view = "Main",
            name_suffix = "",
            notifiers = ["devtools tree closer"],
            priority = 30,  # default
        ),
        config_section(
            name = "chromium",
            repo = "https://chromium.googlesource.com/chromium/src",
            branch = "refs/heads/main",
            name_suffix = " (chromium)",
            builder_group = "chromium.devtools-frontend",
            notifiers = ["devtools tree closer"],
            priority = 30,  # default
        ),
        branch_section("beta"),
        branch_section("stable"),
        branch_section("extended"),
    ],
    builders = [
        builder_descriptor(
            name = "DevTools Linux",
            recipe_name = "chromium_integration",
            excluded_from = ["beta", "stable", "extended"],
            execution_timeout = 2 * time.hour,
        ),
        builder_descriptor(
            name = "DevTools Linux Fastbuild",
            recipe_name = "chromium_integration",
            excluded_from = ["beta", "stable", "extended", "chromium"],
            execution_timeout = 2 * time.hour,
            description_html = """
This is the same with <a href="https://ci.chromium.org/p/devtools-frontend/builders/ci/DevTools%20Linux">
DevTools Linux</a> but has devtools_skip_typecheck=True.""",
        ),
        builder_descriptor(
            name = "Stand-alone Linux",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["chromium"],
        ),
        builder_descriptor(
            name = "Stand-alone Win",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["chromium"],
            dims = dimensions.win10,
            execution_timeout = time.hour + 15 * time.minute,
        ),
        builder_descriptor(
            name = "Linux Compile Debug",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["chromium"],
            properties = {"builder_config": "Debug"},
        ),
        builder_descriptor(
            name = "Linux Compile Debug Fastbuild",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["beta", "stable", "extended", "chromium"],
            properties = {
                "builder_config": "Debug",
                "devtools_skip_typecheck": True,
            },
            description_html = """
This is the same with <a href="https://ci.chromium.org/p/devtools-frontend/builders/ci/Linux%20Compile%20Debug">
Linux Compile Debug</a> but has devtools_skip_typecheck=True.""",
        ),
        builder_descriptor(
            name = "Linux Compile Full Release",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["chromium", "beta", "stable", "extended"],
            properties = {"clobber": True},
        ),
        builder_descriptor(
            name = "Stand-alone Mac",
            recipe_name = "devtools/devtools-frontend",
            dims = dimensions.mac,
            excluded_from = ["chromium", "beta", "stable", "extended"],
        ),
        builder_descriptor(
            name = "Linux Official",
            recipe_name = "devtools/devtools-frontend",
            excluded_from = ["chromium"],
            properties = {"is_official_build": True},
            notification_muted = True,
        ),
    ],
)