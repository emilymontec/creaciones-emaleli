"use client";

import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import clsx from "clsx";
import {
  Image as ImageIcon,
  Video,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  Repeat,
  Plus,
  Send,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { Card, CardHeader } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Button } from "@/src/frontend/components/ui/Button";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Select } from "@/src/frontend/components/ui/Select";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import {
  subirAvanceProduccionAction,
  eliminarAvanceProduccionAction,
  toggleVisibilidadAvanceAction,
  agregarComentarioProduccionAction,
  crearSolicitudCambioAction,
  responderSolicitudCambioAction,
  cambiarEstadoSolicitudAction,
  agregarComentarioSolicitudAction,
  type ProduccionActionState,
} from "@/src/backend/modules/pedidos/actions/manageProduccion";
import type {
  ProduccionAvance,
  ComentarioProduccion,
  SolicitudCambio,
  EstadoSolicitudCambio,
} from "@/generated/prisma/client";

const initialAction: ProduccionActionState = { success: false };

const SOLICITUD_ESTADO_LABEL: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CERRADA: "Cerrada",
};

const SOLICITUD_ESTADO_OPTIONS = [
  { value: "ABIERTA", label: "Abierta" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "APROBADA", label: "Aprobada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "CERRADA", label: "Cerrada" },
];

const VISIBILIDAD_OPTIONS = [
  { value: "INTERNO", label: "Interno (solo equipo)" },
  { value: "CLIENTE", label: "Visible al cliente" },
];

const ORIGEN_OPTIONS = [
  { value: "ADMIN", label: "Solicitud del equipo" },
  { value: "CLIENTE", label: "Solicitud del cliente" },
];

export function ProduccionSection({ pedidoId }: { pedidoId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [avanceUpload, avanceDispatch, avancePending] = useActionState(
    subirAvanceProduccionAction,
    initialAction,
  );
  const [comentProdState, comentProdDispatch, comentProdPending] =
    useActionState(agregarComentarioProduccionAction, initialAction);
  const [
    solicitudCreateState,
    solicitudCreateDispatch,
    solicitudCreatePending,
  ] = useActionState(crearSolicitudCambioAction, initialAction);
  const [respuestaState, respuestaDispatch, respuestaPending] = useActionState(
    responderSolicitudCambioAction,
    initialAction,
  );
  const [
    comentSolicitudState,
    comentSolicitudDispatch,
    comentSolicitudPending,
  ] = useActionState(agregarComentarioSolicitudAction, initialAction);

  const [visibleClienteCheck, setVisibleClienteCheck] = useState(true);
  const [comentProd, setComentProd] = useState("");
  const [visibilidadComent, setVisibilidadComent] = useState("INTERNO");
  const [solicitudModalOpen, setSolicitudModalOpen] = useState(false);
  const [respuestaModal, setRespuestaModal] = useState<{
    id: string;
  } | null>(null);
  const [comentSolicitudModal, setComentSolicitudModal] = useState<{
    id: string;
  } | null>(null);
  const [nuevoComentSolicitud, setNuevoComentSolicitud] = useState("");
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [estadoRespuesta, setEstadoRespuesta] = useState("EN_REVISION");
  const [avances, setAvances] = useState<ProduccionAvance[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioProduccion[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCambio[]>([]);

  const recargar = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/pedidos/${pedidoId}/produccion`).catch(
        () => null,
      );
      if (res && res.ok) {
        const json = await res.json();
        if (json.success) {
          setAvances(json.data.avances);
          setComentarios(json.data.comentarios);
          setSolicitudes(json.data.solicitudes);
        }
      }
    });
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  useEffect(() => {
    if (avanceUpload.success) {
      toast({
        title: avanceUpload.message ?? "Avance registrado",
        variant: "success",
      });
      recargar();
    } else if (avanceUpload.error) {
      toast({
        title: "No se pudo subir el avance",
        description: avanceUpload.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avanceUpload]);

  useEffect(() => {
    if (comentProdState.success) {
      toast({
        title: comentProdState.message ?? "Comentario agregado",
        variant: "success",
      });
      setComentProd("");
      recargar();
    } else if (comentProdState.error) {
      toast({
        title: "Error en comentario",
        description: comentProdState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comentProdState]);

  useEffect(() => {
    if (solicitudCreateState.success) {
      toast({
        title: solicitudCreateState.message ?? "Solicitud creada",
        variant: "success",
      });
      setSolicitudModalOpen(false);
      recargar();
    } else if (solicitudCreateState.error) {
      toast({
        title: "No se creó la solicitud",
        description: solicitudCreateState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudCreateState]);

  useEffect(() => {
    if (respuestaState.success) {
      toast({
        title: respuestaState.message ?? "Respuesta registrada",
        variant: "success",
      });
      setRespuestaModal(null);
      setTextoRespuesta("");
      recargar();
    } else if (respuestaState.error) {
      toast({
        title: "No se pudo registrar la respuesta",
        description: respuestaState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respuestaState]);

  useEffect(() => {
    if (comentSolicitudState.success) {
      toast({
        title: comentSolicitudState.message ?? "Comentario agregado",
        variant: "success",
      });
      setComentSolicitudModal(null);
      setNuevoComentSolicitud("");
      recargar();
    } else if (comentSolicitudState.error) {
      toast({
        title: "Error en comentario",
        description: comentSolicitudState.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comentSolicitudState]);

  const handleEliminarAvance = async (id: string) => {
    startTransition(async () => {
      const res = await eliminarAvanceProduccionAction(pedidoId, id);
      if (res.success) {
        toast({ title: res.message ?? "Avance eliminado", variant: "success" });
        recargar();
      } else if (res.error) {
        toast({
          title: "Error al eliminar",
          description: res.error,
          variant: "error",
        });
      }
    });
  };

  const handleToggleVisibilidad = async (
    id: string,
    visibleCliente: boolean,
  ) => {
    startTransition(async () => {
      const res = await toggleVisibilidadAvanceAction(
        pedidoId,
        id,
        visibleCliente,
      );
      if (res.success) {
        toast({
          title: res.message ?? "Visibilidad actualizada",
          variant: "success",
        });
        recargar();
      } else if (res.error) {
        toast({
          title: "Error de visibilidad",
          description: res.error,
          variant: "error",
        });
      }
    });
  };

  const handleCambiarEstadoSolicitud = async (
    id: string,
    estado: EstadoSolicitudCambio,
  ) => {
    startTransition(async () => {
      const res = await cambiarEstadoSolicitudAction(id, estado);
      if (res.success) {
        toast({
          title: res.message ?? "Estado actualizado",
          variant: "success",
        });
        recargar();
      } else if (res.error) {
        toast({
          title: "Error",
          description: res.error,
          variant: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary-600" />
              Avances de producción
            </div>
          }
          action={
            <Badge variant="neutral">
              {avances.length} {avances.length === 1 ? "archivo" : "archivos"}
            </Badge>
          }
        />
        <form
          action={avanceDispatch}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] items-end mb-5 p-4 rounded-input border border-dashed border-gray-200 bg-gray-50/50"
        >
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <div>
            <Input
              name="archivo"
              type="file"
              label="Subir foto o video de avance"
              accept="image/*,video/*"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <Input
              name="titulo"
              label="Título (opcional)"
              placeholder="Ej: Primera capa lista"
            />
          </div>
          <div className="sm:col-span-1 flex items-end gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-gray-600 pb-2.5">
              <input
                type="checkbox"
                name="visibleCliente"
                checked={visibleClienteCheck}
                onChange={(e) => setVisibleClienteCheck(e.target.checked)}
                className="rounded"
              />
              Visible para cliente
            </label>
          </div>
          <div className="sm:col-span-1">
            <Textarea
              name="descripcion"
              label="Descripción (opcional)"
              placeholder="Detalle del avance..."
              rows={1}
            />
          </div>
          <div className="sm:col-span-full flex justify-end gap-2">
            {avanceUpload.error && (
              <p className="text-xs text-error mr-auto self-center">
                {avanceUpload.error}
              </p>
            )}
            <Button type="submit" loading={avancePending} size="sm">
              <Upload className="size-4" />
              Subir
            </Button>
          </div>
        </form>

        {avances.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">
            No hay avances de producción todavía. Sube la primera foto/video
            para documentar el proceso.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {avances.map((a) => (
              <div
                key={a.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 group"
              >
                {a.tipo === "IMAGEN" ? (
                  <div className="relative aspect-square w-full bg-gray-100">
                    <img
                      src={a.url}
                      alt={a.titulo || a.nombre || "avance"}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-black">
                    <video
                      src={a.url}
                      controls
                      playsInline
                      className="size-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      {a.tipo === "IMAGEN" ? (
                        <ImageIcon className="size-3" />
                      ) : (
                        <Video className="size-3" />
                      )}
                      {a.tipo === "IMAGEN" ? "Foto" : "Video"}
                    </span>
                    <Badge variant={a.visibleCliente ? "success" : "neutral"}>
                      {a.visibleCliente ? "Cliente" : "Interno"}
                    </Badge>
                  </div>
                  {(a.titulo || a.nombre) && (
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {a.titulo || a.nombre}
                    </p>
                  )}
                  {a.descripcion && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {a.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 gap-1 text-[11px] text-gray-400">
                    <span>
                      {new Date(a.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleVisibilidad(a.id, !a.visibleCliente)
                        }
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                        title={
                          a.visibleCliente
                            ? "Ocultar del cliente"
                            : "Mostrar al cliente"
                        }
                      >
                        {a.visibleCliente ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarAvance(a.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                        title="Eliminar avance"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary-600" />
              Comentarios de producción
            </div>
          }
          action={
            <Badge variant="neutral">
              {comentarios.length}{" "}
              {comentarios.length === 1 ? "comentario" : "comentarios"}
            </Badge>
          }
        />
        <form
          action={comentProdDispatch}
          className="space-y-3 p-4 rounded-input border border-gray-100 bg-gray-50/50 mb-4"
        >
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Textarea
                name="contenido"
                label="Nuevo comentario"
                value={comentProd}
                onChange={(e) => setComentProd(e.target.value)}
                placeholder="Ej: Cliente confirmó cambio de diseño, listar cambios..."
                rows={2}
              />
            </div>
            <div>
              <Select
                name="visibilidad"
                label="Visibilidad"
                value={visibilidadComent}
                onChange={(e) => setVisibilidadComent(e.target.value)}
                options={VISIBILIDAD_OPTIONS}
              />
            </div>
          </div>
          {comentProdState.error && (
            <p className="text-xs text-error">{comentProdState.error}</p>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={comentProdPending} size="sm">
              <Send className="size-3.5" />
              Publicar comentario
            </Button>
          </div>
        </form>

        {comentarios.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">Sin comentarios todavía.</p>
        ) : (
          <ul className="space-y-3">
            {comentarios.map((c) => (
              <li
                key={c.id}
                className={clsx(
                  "rounded-xl border p-4",
                  c.visibilidad === "CLIENTE"
                    ? "bg-primary-50 border-primary-100"
                    : "bg-gray-50 border-gray-100",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-gray-700">
                    {(c.usuario as any)?.nombre || c.autorNombre || "Equipo"}
                    <span className="font-normal text-gray-400 ml-2">
                      · {new Date(c.createdAt).toLocaleString("es-CO")}
                    </span>
                  </p>
                  <Badge
                    variant={
                      c.visibilidad === "CLIENTE" ? "success" : "neutral"
                    }
                  >
                    {c.visibilidad === "CLIENTE" ? "Cliente" : "Interno"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {c.contenido}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Repeat className="size-4 text-primary-600" />
              Solicitudes de cambio
            </div>
          }
          action={
            <Button size="sm" onClick={() => setSolicitudModalOpen(true)}>
              <Plus className="size-4" />
              Nueva solicitud
            </Button>
          }
        />
        {solicitudes.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">
            No hay solicitudes de cambio para este pedido.
          </p>
        ) : (
          <ul className="space-y-4">
            {solicitudes.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="info">
                        {s.origen === "CLIENTE"
                          ? "Del cliente"
                          : "Equipo Emaleli"}
                      </Badge>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          s.estado === "ABIERTA" &&
                            "bg-amber-100 text-amber-800 border-amber-200",
                          s.estado === "EN_REVISION" &&
                            "bg-blue-100 text-blue-800 border-blue-200",
                          s.estado === "APROBADA" &&
                            "bg-emerald-100 text-emerald-800 border-emerald-200",
                          s.estado === "RECHAZADA" &&
                            "bg-red-100 text-red-800 border-red-200",
                          s.estado === "CERRADA" &&
                            "bg-gray-100 text-gray-800 border-gray-200",
                        )}
                      >
                        {s.estado === "APROBADA" && (
                          <Check className="size-3" />
                        )}
                        {s.estado === "RECHAZADA" && <X className="size-3" />}
                        {SOLICITUD_ESTADO_LABEL[s.estado] || s.estado}
                      </span>
                      {s.creadorPor && (
                        <span className="text-[11px] text-gray-400">
                          · Creado por {s.creadorPor}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {s.descripcion}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleString("es-CO")}
                      {s.resueltoAt && (
                        <>
                          {" · Resuelto el "}
                          {new Date(s.resueltoAt).toLocaleString("es-CO")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Select
                      size="sm"
                      value={s.estado}
                      onChange={(e) =>
                        handleCambiarEstadoSolicitud(
                          s.id,
                          e.target.value as EstadoSolicitudCambio,
                        )
                      }
                      options={SOLICITUD_ESTADO_OPTIONS}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setRespuestaModal({ id: s.id })}
                    >
                      Responder
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setComentSolicitudModal({ id: s.id })}
                    >
                      <MessageCircle className="size-4" />
                    </Button>
                  </div>
                </div>

                {s.respuestaCliente && (
                  <div className="mt-4 rounded-lg bg-white border border-gray-100 p-3">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Respuesta al cliente
                      {s.respuestaAt && (
                        <span className="normal-case text-gray-400 font-normal">
                          {" "}
                          · {new Date(s.respuestaAt).toLocaleString("es-CO")}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-800">
                      {s.respuestaCliente}
                    </p>
                  </div>
                )}

                {(s.comentarios as any[])?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Comentarios ({(s.comentarios as any[]).length})
                    </p>
                    {(s.comentarios as any[]).map((c: any) => (
                      <div
                        key={c.id}
                        className={clsx(
                          "rounded-lg p-3 text-sm border",
                          c.origen === "CLIENTE"
                            ? "bg-primary-50 border-primary-100"
                            : "bg-white border-gray-100",
                        )}
                      >
                        <p className="text-[11px] font-semibold text-gray-500 mb-0.5">
                          {c.autor}
                          <span className="font-normal text-gray-400">
                            {" "}
                            · {new Date(c.createdAt).toLocaleString("es-CO")}
                          </span>
                          {c.visibleCliente && (
                            <Badge variant="success" className="ml-2">
                              Cliente
                            </Badge>
                          )}
                        </p>
                        <p className="text-gray-800">{c.contenido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={solicitudModalOpen}
        onClose={() => setSolicitudModalOpen(false)}
        title="Nueva solicitud de cambio"
        description="Registra una solicitud de cambio para el pedido."
      >
        <form action={solicitudCreateDispatch} className="space-y-4">
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <Select
            name="origen"
            label="Origen de la solicitud"
            options={ORIGEN_OPTIONS}
            defaultValue="ADMIN"
          />
          <Textarea
            name="descripcion"
            label="Descripción del cambio"
            placeholder="Ej: Cambio de nombre en vaso grabado láser..."
            rows={3}
            required
          />
          <Textarea
            name="comentarioInicial"
            label="Comentario inicial visible (opcional)"
            placeholder="Detalle adicional para contextualizar el cambio"
            rows={2}
          />
          {solicitudCreateState.error && (
            <p className="text-xs text-error">{solicitudCreateState.error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSolicitudModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={solicitudCreatePending}>
              Crear solicitud
            </Button>
          </div>
        </form>
      </Modal>

      {respuestaModal && (
        <Modal
          open
          onClose={() => setRespuestaModal(null)}
          title="Responder solicitud"
          description="La respuesta quedará visible para el cliente."
        >
          <form action={respuestaDispatch} className="space-y-4">
            <input type="hidden" name="solicitudId" value={respuestaModal.id} />
            <Textarea
              name="respuesta"
              label="Respuesta al cliente"
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              placeholder="Ej: Aceptamos el cambio, se reprogramará la entrega para..."
              rows={4}
              required
            />
            <Select
              name="estado"
              label="Cambiar estado al responder"
              options={SOLICITUD_ESTADO_OPTIONS}
              value={estadoRespuesta}
              onChange={(e) => setEstadoRespuesta(e.target.value)}
            />
            {respuestaState.error && (
              <p className="text-xs text-error">{respuestaState.error}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRespuestaModal(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={respuestaPending}>
                Enviar respuesta
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {comentSolicitudModal && (
        <Modal
          open
          onClose={() => setComentSolicitudModal(null)}
          title="Agregar comentario a solicitud"
        >
          <form action={comentSolicitudDispatch} className="space-y-4">
            <input
              type="hidden"
              name="solicitudId"
              value={comentSolicitudModal.id}
            />
            <Textarea
              name="contenido"
              label="Comentario"
              value={nuevoComentSolicitud}
              onChange={(e) => setNuevoComentSolicitud(e.target.value)}
              placeholder="Anotación adicional sobre esta solicitud..."
              rows={3}
              required
            />
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  name="visibleCliente"
                  defaultChecked
                  className="rounded"
                />
                Visible para el cliente
              </label>
              <Select
                size="sm"
                name="origen"
                label=""
                defaultValue="ADMIN"
                options={ORIGEN_OPTIONS}
              />
            </div>
            {comentSolicitudState.error && (
              <p className="text-xs text-error">{comentSolicitudState.error}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setComentSolicitudModal(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={comentSolicitudPending}>
                Guardar comentario
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
