import type { Metadata } from "next";
import { Settings, Save, Store, MessageCircle, Globe, ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Button } from "@/src/frontend/components/ui/Button";

export const metadata: Metadata = {
  title: "Configuración de la Tienda | Emaleli Admin",
};

export default function ConfiguracionAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="size-6 text-primary-600" /> Configuración de la Tienda
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra la información general del negocio, números de WhatsApp y parámetros del sitio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Store className="size-4 text-primary-600" /> Datos de la Empresa
              </div>
            }
          />
          <form className="space-y-4">
            <Input label="Nombre comercial" defaultValue="Creaciones Emaleli" />
            <Input label="Correo electrónico principal" defaultValue="contacto@creacionesemaleli.com" />
            <Input label="Dirección de la tienda / taller" defaultValue="Cra. 45 # 12-34, Bucaramanga, Santander" />
            <Input label="Horario de atención" defaultValue="Lunes a Viernes 8:00 AM - 6:00 PM | Sábados 8:00 AM - 1:00 PM" />
            <div className="flex justify-end pt-2">
              <Button type="button">
                <Save className="size-4" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-emerald-600" /> WhatsApp y Redes Sociales
              </div>
            }
          />
          <form className="space-y-4">
            <Input label="Número de WhatsApp (57...)" defaultValue="573001234567" helperText="Formato internacional sin espacio ni signo +" />
            <Input label="Instagram URL" defaultValue="https://instagram.com/creacionesemaleli" />
            <Input label="Facebook URL" defaultValue="https://facebook.com/creacionesemaleli" />
            <Textarea
              label="Mensaje predeterminado de checkout"
              defaultValue="¡Hola Creaciones Emaleli! Acabo de hacer el pedido {codigo}. Adjunto detalles."
              rows={3}
            />
            <div className="flex justify-end pt-2">
              <Button type="button">
                <Save className="size-4" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
