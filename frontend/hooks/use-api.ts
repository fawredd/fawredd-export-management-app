'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

// Tariff Positions hooks
export function useTariffPositions(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['tariff-positions', params],
    queryFn: () => apiClient.getTariffPositions(params),
  });
}

export function useTariffPosition(id: string) {
  return useQuery({
    queryKey: ['tariff-positions', id],
    queryFn: () => apiClient.getTariffPosition(id),
    enabled: !!id,
  });
}

export function useCreateTariffPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createTariffPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariff-positions'] });
    },
  });
}

export function useUpdateTariffPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateTariffPosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariff-positions'] });
    },
  });
}

export function useDeleteTariffPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTariffPosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariff-positions'] });
    },
  });
}

// Units of Measure hooks
export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => apiClient.getUnits(),
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['units', id],
    queryFn: () => apiClient.getUnit(id),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

// Countries hooks
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => apiClient.getCountries(),
  });
}

export function useCountry(id: string) {
  return useQuery({
    queryKey: ['countries', id],
    queryFn: () => apiClient.getCountry(id),
    enabled: !!id,
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createCountry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
}

export function useDeleteCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
}

// Export Tasks hooks
export function useExportTasks(params?: { page?: number; limit?: number; countryId?: string; status?: string }) {
  return useQuery({
    queryKey: ['export-tasks', params],
    queryFn: () => apiClient.getExportTasks(params),
  });
}

export function useExportTask(id: string) {
  return useQuery({
    queryKey: ['export-tasks', id],
    queryFn: () => apiClient.getExportTask(id),
    enabled: !!id,
  });
}

export function useCreateExportTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createExportTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-tasks'] });
    },
  });
}

export function useUpdateExportTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateExportTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-tasks'] });
    },
  });
}

export function useUpdateExportTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, completedAt }: { id: string; status: string; completedAt?: string }) =>
      apiClient.updateExportTaskStatus(id, status, completedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-tasks'] });
    },
  });
}

export function useDeleteExportTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteExportTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-tasks'] });
    },
  });
}

// Invoices hooks
export function useInvoices(params?: { page?: number; limit?: number; budgetId?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => apiClient.getInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => apiClient.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useGenerateInvoicePdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.generateInvoicePdf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// Packing Lists hooks
export function usePackingLists(params?: { page?: number; limit?: number; budgetId?: string }) {
  return useQuery({
    queryKey: ['packing-lists', params],
    queryFn: () => apiClient.getPackingLists(params),
  });
}

export function usePackingList(id: string) {
  return useQuery({
    queryKey: ['packing-lists', id],
    queryFn: () => apiClient.getPackingList(id),
    enabled: !!id,
  });
}

export function useCreatePackingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createPackingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-lists'] });
    },
  });
}

export function useAutoGeneratePackingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => apiClient.autoGeneratePackingList(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-lists'] });
    },
  });
}

export function useUpdatePackingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updatePackingList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-lists'] });
    },
  });
}

export function useGeneratePackingListPdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.generatePackingListPdf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-lists'] });
    },
  });
}

export function useDeletePackingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deletePackingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing-lists'] });
    },
  });
}
