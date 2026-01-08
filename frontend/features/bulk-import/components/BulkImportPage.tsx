"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BulkImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [results, setResults] = useState<any>(null)

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bulk-import/products`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Upload failed')
            }

            return response.json()
        },
        onSuccess: (data) => {
            setResults(data.results)
            toast.success(data.message)
            setFile(null)
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to import products')
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('Please select a CSV file')
                return
            }
            setFile(selectedFile)
            setResults(null)
        }
    }

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file first')
            return
        }
        uploadMutation.mutate(file)
    }

    const downloadTemplate = () => {
        const csvContent = `sku,title,description,weightKg,volumeM3,composition,tariffPositionId,unitId,providerId
PROD-001,Sample Product,Product description,10.5,0.05,100% Cotton,,,
PROD-002,Another Product,Another description,5.2,0.03,Polyester,,,`

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'product_import_template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Bulk Import Products</h1>
                <p className="text-muted-foreground">Import multiple products from a CSV file</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Requirements:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Maximum 1000 products per file</li>
                                <li>Required fields: <code className="bg-muted px-1 rounded">sku</code>, <code className="bg-muted px-1 rounded">title</code></li>
                                <li>Optional fields: description, weightKg, volumeM3, composition, tariffPositionId, unitId, providerId</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={downloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={uploadMutation.isPending}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploadMutation.isPending}
                        className="w-full"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload and Import'}
                    </Button>
                </CardContent>
            </Card>

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Successful</p>
                                    <p className="text-2xl font-bold text-green-600">{results.success}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                                </div>
                            </div>
                        </div>

                        {results.errors && results.errors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Errors:</h3>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {results.errors.map((error: any, index: number) => (
                                        <Alert key={index} variant="destructive">
                                            <AlertDescription>
                                                <strong>Row {error.row}</strong> (SKU: {error.sku}): {error.error}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
