export const getCurrentStep = () => {
  // Using URL to parse pathname makes it more robust
  const { pathname } = new URL(window.location.href);
  const segments = pathname.split("/").filter;
  // The last segment is considered the step. If the business domain is the base, adjust accordingly.
  return segments[segments.length - 1].split("#")[0];
};

export const goBack = () => {
  window.history.back();
};
