/**
 * @file NewsPage.tsx
 * @description Portal de noticias, comunicados oficiales y novedades deportivas del club.
 * Funcionalidades:
 * - Publicación de artículos con imagen de portada, título, autor del staff y cuerpo de la noticia.
 * - Modo lectura tipo revista / magazine con modal a pantalla completa.
 * - Gestión editorial: publicación, edición y baja de notas periodísticas.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Calendar,
  User,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { NewsArticle } from '../types/soccer';
import { newsSchema, NewsFormData } from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

/**
 * Vista de revista de noticias y comunicados del club.
 */
export const NewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);

  // 1. Fetch news
  const { data: news = [], isLoading: isLoadingNews } = useQuery({
    queryKey: ['news'],
    queryFn: () => soccerApi.getNews(),
  });

  // 2. Fetch users for author select
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: soccerApi.getUsers,
  });

  // Form for new article
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
      authorId: users[0]?.id || 1,
    },
  });

  // Mutation: Create News
  const createNewsMutation = useMutation({
    mutationFn: (data: NewsFormData) =>
      soccerApi.createNews({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || undefined,
        authorId: data.authorId,
        publicationDate: new Date().toISOString(),
      }),
    onSuccess: (newA) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Noticia Publicada',
        message: `El artículo "${newA.title}" está en el boletín.`,
      });
      setIsCreateOpen(false);
      reset();
    },
  });

  // Mutation: Delete News
  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({ type: 'info', title: 'Artículo Eliminado' });
      setDeletingArticle(null);
    },
  });

  const featured = news[0];
  const restNews = news.slice(1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Noticias y Boletines del Club
            <Badge variant="purple" size="sm">
              {news.length} Artículos
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comunicados oficiales de la academia, crónicas de partidos e informes técnicos
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Comunicado</span>
        </button>
      </div>

      {isLoadingNews ? (
        <LoadingSkeleton type="card" count={4} />
      ) : news.length === 0 ? (
        <EmptyState
          title="Sin noticias publicadas"
          description="Aún no se han redactado comunicados oficiales. Comienza publicando el primero."
          action={{
            label: 'Publicar Primer Comunicado',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Featured Article Card */}
          {featured ? (
            <div
              onClick={() => setSelectedArticle(featured)}
              className="group cursor-pointer relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm dark:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              <div className="h-56 sm:h-72 lg:h-full w-full overflow-hidden relative">
                <img
                  src={
                    featured.imageUrl ||
                    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="emerald" size="sm" dot>
                    Destacado Oficial
                  </Badge>
                </div>
              </div>

              <div className="p-5 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{new Date(featured.publicationDate).toLocaleDateString('es-ES')}</span>
                    <span>•</span>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{featured.authorUsername || 'Redacción Deportiva'}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors leading-tight">
                    {featured.title}
                  </h2>

                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                    {featured.content}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    Leer crónica completa <BookOpen className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingArticle(featured);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Grid of Remaining Articles */}
          {restNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {restNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-xs hover:shadow-md dark:shadow-none flex flex-col justify-between"
                >
                  <div>
                    <div className="h-40 sm:h-44 w-full overflow-hidden relative">
                      <img
                        src={
                          article.imageUrl ||
                          'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        <span>{new Date(article.publicationDate).toLocaleDateString('es-ES')}</span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {article.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400">
                      Por: <strong className="text-slate-800 dark:text-slate-200">{article.authorUsername || 'Prensa'}</strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingArticle(article);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar artículo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || 'Artículo'}
        maxWidth="2xl"
      >
        {selectedArticle ? (
          <div className="space-y-4">
            {selectedArticle.imageUrl ? (
              <div className="rounded-2xl overflow-hidden h-48 sm:h-60 w-full">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {new Date(selectedArticle.publicationDate).toLocaleString('es-ES')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {selectedArticle.authorUsername || 'Redacción'}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-line py-2">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar Lectura
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* CREATE ARTICLE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publicar Comunicado o Noticia"
        description="Escribe el titular, cuerpo de la noticia y selecciona el autor oficial"
      >
        <form onSubmit={handleSubmit((d) => createNewsMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Titular de la Noticia
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Ej. Convocatoria oficial para el Torneo Apertura 2025"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.title ? (
              <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              URL de la Imagen de Portada
            </label>
            <input
              {...register('imageUrl')}
              type="text"
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            {errors.imageUrl ? (
              <p className="text-xs text-rose-500 mt-1">{errors.imageUrl.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Autor / Redactor
            </label>
            <select
              {...register('authorId')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.roleName || 'Usuario'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Contenido del Comunicado
            </label>
            <textarea
              {...register('content')}
              rows={5}
              placeholder="Escribe el detalle de la noticia..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.content ? (
              <p className="text-xs text-rose-500 mt-1">{errors.content.message}</p>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createNewsMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createNewsMutation.isPending ? 'Publicando...' : 'Publicar Noticia'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE ARTICLE */}
      <ConfirmDialog
        isOpen={!!deletingArticle}
        onClose={() => setDeletingArticle(null)}
        onConfirm={() => {
          if (deletingArticle) deleteNewsMutation.mutate(deletingArticle.id);
        }}
        title="Eliminar Noticia"
        message={`¿Estás seguro de que deseas eliminar la noticia "${deletingArticle?.title}"?`}
        confirmLabel="Eliminar Comunicado"
        isDangerous
        isLoading={deleteNewsMutation.isPending}
      />
    </div>
  );
};
