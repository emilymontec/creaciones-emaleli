const APP_VERSION = "0.1.0";

export function AdminFooter() {
  return (
    <footer className="border-t border-gray-100">
      <div className="px-4 py-4 text-xs text-gray-400 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Creaciones Emaleli · Panel de
            administración
          </p>
          <p>v{APP_VERSION}</p>
        </div>
      </div>
      <div className="h-[2px] bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500" aria-hidden />
    </footer>
  );
}
