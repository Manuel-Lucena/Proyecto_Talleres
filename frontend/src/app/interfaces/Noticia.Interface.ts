export interface NoticiaResponse {
  idNoticia: number;      
  titulo: string;
  contenido: string;
  fechaPublicacion: string; 
  imagenUrl?: string;
}

export interface NoticiaRequest {
  titulo: string;
  contenido: string;
}