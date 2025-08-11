"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PagesHeaders from "@/components/dashboard/pages-headers";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import InvoiceForm from "@/components/forms/invoice-form";
import {
  invoicesApi,
  Invoice,
  queryKeys,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  // Learner,
  InvoiceWithLearner,
} from "@/lib/api";
import { mockLearners, mockInvoices } from "@/lib/mockData";
import Edit from "@/components/icons/edit";
import Trash from "@/components/icons/trash";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState<InvoiceWithLearner | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Use mock data with populated learner information
  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.invoices.all],
    queryFn: () => Promise.resolve(mockInvoices), // Replace with invoicesApi.getAllInvoices when backend is ready
  });

  // const { data: learners = [] } = useQuery({
  const {} = useQuery({
    queryKey: [queryKeys.learners.all],
    queryFn: () => Promise.resolve(mockLearners), // Replace with learnersApi.getAllLearners when backend is ready
  });

  const [filteredInvoices, setFilteredInvoices] = useState<
    InvoiceWithLearner[]
  >([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Initialize filtered invoices with all invoices when data is loaded
  useEffect(() => {
    if (invoices.length > 0) {
      setFilteredInvoices(invoices);
    }
  }, [invoices]);

  // Mutations for CRUD operations
  const createInvoiceMutation = useMutation({
    mutationFn: invoicesApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.invoices.all] });
      toast.success("Invoice created successfully!");
      setShowForm(false);
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
      invoicesApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.invoices.all] });
      toast.success("Invoice updated successfully!");
      setEditingInvoice(null);
      setShowForm(false);
    },
    onError: () => {
      toast.error("Failed to update invoice");
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: invoicesApi.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.invoices.all] });
      toast.success("Invoice deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete invoice");
    },
  });

  // Handle search results
  const handleSearchResults = (results: InvoiceWithLearner[]) => {
    setFilteredInvoices(results);
  };

  // Function to extract searchable text from invoice items
  const getInvoiceSearchableText = (invoice: InvoiceWithLearner): string[] => {
    return [
      invoice.id || "",
      invoice.status || "",
      `${invoice.amount || 0}`,
      invoice.paymentDetails || "",
      invoice.learnerId.firstName || "",
      invoice.learnerId.lastName || "",
      invoice.learnerId.email || "",
    ].filter(Boolean);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = useCallback((invoice: InvoiceWithLearner) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  }, []);

  const handleDeleteInvoice = useCallback(
    async (invoice: InvoiceWithLearner) => {
      if (!window.confirm("Are you sure you want to delete this invoice?"))
        return;

      setIsDeleting(invoice.id);
      try {
        await deleteInvoiceMutation.mutateAsync(invoice.id);
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      } finally {
        setIsDeleting(null);
      }
    },
    [deleteInvoiceMutation]
  );

  const handleFormSubmit = async (
    data: CreateInvoiceRequest | UpdateInvoiceRequest
  ) => {
    if (editingInvoice) {
      await updateInvoiceMutation.mutateAsync({
        id: editingInvoice.id,
        data: data as UpdateInvoiceRequest,
      });
    } else {
      await createInvoiceMutation.mutateAsync(data as CreateInvoiceRequest);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const getLearnerName = useCallback(
    (learnerData: {
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    }) => {
      return `${learnerData.firstName} ${learnerData.lastName}`;
    },
    []
  );

  const getLearnerEmail = useCallback(
    (learnerData: {
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    }) => {
      return learnerData.email;
    },
    []
  );

  const getStatusBadgeVariant = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "success" as const;
      case "unpaid":
        return "secondary" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<InvoiceWithLearner>[]>(
    () => [
      {
        accessorKey: "learner",
        header: "LEARNERS",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                {getLearnerName(invoice.learnerId)
                  .split(" ")
                  .map((n) => n.charAt(0))
                  .join("")}
              </div>
              <span className="font-medium">
                {getLearnerName(invoice.learnerId)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "EMAIL ADDRESSES",
        cell: ({ row }) => getLearnerEmail(row.original.learnerId),
      },
      {
        accessorKey: "createdAt",
        header: "DATE JOINED",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status.toUpperCase()}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-[#F9FBFC] flex items-center justify-center cursor-pointer"
                onClick={() => handleEditInvoice(invoice)}
                disabled={isDeleting === invoice.id}
              >
                <Edit />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-[#F9FBFC] flex items-center justify-center cursor-pointer"
                onClick={() => handleDeleteInvoice(invoice)}
                disabled={isDeleting === invoice.id}
              >
                <Trash />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      isDeleting,
      getLearnerName,
      getLearnerEmail,
      handleEditInvoice,
      handleDeleteInvoice,
    ]
  );

  // Create table instance
  const table = useReactTable({
    data: filteredInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (error) {
    return (
      <div>
        <PagesHeaders
          heading="Manage Invoices"
          subheading="Filter, sort, and access detailed invoices"
          items={[]}
          getSearchableText={getInvoiceSearchableText}
          onSearchResults={handleSearchResults}
          searchPlaceholder="Search invoices..."
          addButtonText="Add New Invoice"
          onAddClick={handleAddInvoice}
          isLoading={false}
        />
        <div className="text-center py-8">
          <p className="text-destructive">
            Failed to load invoices. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PagesHeaders
        heading="Manage Invoices"
        subheading="Filter, sort, and access detailed invoices"
        items={invoices}
        getSearchableText={getInvoiceSearchableText}
        onSearchResults={handleSearchResults}
        searchPlaceholder="Search invoices by learner, amount, status..."
        addButtonText="Add New Invoice"
        onAddClick={handleAddInvoice}
        isLoading={isLoading}
      />

      <div className="flex flex-col gap-6 mt-6">
        {/* Invoices Table */}
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={`px-6 h-14 ${
                          header.id === "actions" ? "w-[100px]" : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: pagination.pageSize }).map(
                    (_, index) => (
                      <TableRow key={index} className="h-[76px]">
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex gap-1">
                            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`h-[76px] ${
                        index % 2 === 0 ? "bg-[#F9FBFC]" : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-12 px-6"
                    >
                      <p className="text-muted-foreground">
                        {invoices.length === 0
                          ? "No invoices available."
                          : "No invoices match your search."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredInvoices.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
              <div className="text-sm text-muted-foreground flex-shrink-0">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} invoices
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center gap-1 min-w-0"
                >
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center gap-1 min-w-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[496px] max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 top-8 z-10 p-1 h-auto w-auto bg-background/80 hover:bg-background"
              onClick={handleFormCancel}
            >
              <X className="h-6 w-8 text-[#7F7E83]" />
              <span className="sr-only">Close</span>
            </Button>
            <InvoiceForm
              invoice={
                editingInvoice
                  ? {
                      ...editingInvoice,
                      learnerId: editingInvoice.learnerId.email, // Convert back to string for form
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              isLoading={
                createInvoiceMutation.isPending ||
                updateInvoiceMutation.isPending
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
