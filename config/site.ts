export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "BiblioTech",
	description: "BiblioTech, votre bibliothèque connectée",
	navItems: [
	{
		label: "Accueil",
		href: "/",
	},
    {
      label: "Livres",
      href: "/livres",
    },
	],
	navMenuItems: [
		{
			label: "Profile",
			href: "/profile",
		},
		{
			label: "Dashboard",
			href: "/dashboard",
		},
		{
			label: "Projects",
			href: "/projects",
		},
		{
			label: "Team",
			href: "/team",
		},
		{
			label: "Calendar",
			href: "/calendar",
		},
		{
			label: "Settings",
			href: "/settings",
		},
		{
			label: "Help & Feedback",
			href: "/help-feedback",
		},
		{
			label: "Logout",
			href: "/logout",
		},
	],

};
