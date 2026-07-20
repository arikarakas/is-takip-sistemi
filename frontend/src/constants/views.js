export const VIEWS = {
    PROJECTS: 'projects',
    ASSIGNED: 'assigned',
    ACTIVITY: 'activity',
    USERS: 'users',
    MACHINES: 'machines',
    APPOINTMENTS: 'appointments',
};

export const DEFAULT_VIEW = VIEWS.PROJECTS;

export const VIEW_SLUGS = {
    [VIEWS.PROJECTS]: 'projeler',
    [VIEWS.ASSIGNED]: 'atamalar',
    [VIEWS.ACTIVITY]: 'degisiklikler',
    [VIEWS.USERS]: 'kullanicilar',
    [VIEWS.MACHINES]: 'makineler',
    [VIEWS.APPOINTMENTS]: 'randevular',
};

export const SLUG_TO_VIEW = Object.fromEntries(
    Object.entries(VIEW_SLUGS).map(([view, slug]) => [slug, view]),
);

export function viewFromSlug(slug) {
    if (!slug) return DEFAULT_VIEW;
    return SLUG_TO_VIEW[slug] ?? DEFAULT_VIEW;
}

export function slugFromView(view) {
    return VIEW_SLUGS[view] ?? VIEW_SLUGS[DEFAULT_VIEW];
}
