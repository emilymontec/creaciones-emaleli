const APP_VERSION = "0.1.0";

export function AdminFooter() {
  return (
    <footer className="flex flex-col gap-1 border-t border-gray-100 px-4 py-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>
        © {new Date().getFullYear()} Creaciones Emaleli · Panel de
        administración
      </p>
      <p>v{APP_VERSION}</p>
    </footer>
  );
}
