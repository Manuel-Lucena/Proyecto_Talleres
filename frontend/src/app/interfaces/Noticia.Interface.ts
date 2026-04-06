/**
 * Estructura de las noticias publicadas en el portal.
 */
export interface NoticiaResponse {
  idNoticia: number;      
  titulo: string;
  contenido: string;
  fechaPublicacion: string; 
  imagenUrl?: string;
}

/**
 * Datos requeridos para redactar una nueva noticia.
 */
export interface NoticiaRequest {
  titulo: string;
  contenido: string;
}