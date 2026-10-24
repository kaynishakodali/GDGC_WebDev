/** Abstract nebula washes and a quiet star field shared by every app route. */
export function StudioAtmosphere() {
  return (
    <div aria-hidden="true" className="studio-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <div className="nebula-wash nebula-wash-a" />
      <div className="nebula-wash nebula-wash-b" />
      <div className="nebula-wash nebula-wash-c" />
      <div className="nebula-wash nebula-wash-d" />
      <div className="nebula-wash nebula-wash-e" />
      <div className="nebula-wash nebula-wash-f" />
      <div className="nebula-stars" />
      <div className="nebula-grain" />
    </div>
  );
}
