import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Assignment, Close, Save } from '@mui/icons-material';
import Button from '../ui/Button';
import type { ReportHeader } from '../../types';

interface ReportHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (header: ReportHeader) => void;
  initialData?: Partial<ReportHeader>;
}

const ReportHeaderModal: React.FC<ReportHeaderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ReportHeader>({
    samplingDate: initialData.samplingDate || new Date().toISOString().split('T')[0],
    idTrafo: initialData.idTrafo || '',
    serialNo: initialData.serialNo || '',
    powerRating: initialData.powerRating || '',
    voltageRatio: initialData.voltageRatio || '',
    category: initialData.category || '',
    manufacture: initialData.manufacture || '',
    oilBrand: initialData.oilBrand || '',
    weightVolumeOil: initialData.weightVolumeOil || '',
    year: initialData.year || new Date().getFullYear().toString(),
    temperature: initialData.temperature || '',
    samplingPoint: initialData.samplingPoint || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ReportHeader, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formFields = [
    { key: 'samplingDate', label: 'Sampling Date', type: 'date' },
    { key: 'idTrafo', label: 'ID Trafo', type: 'text' },
    { key: 'serialNo', label: 'Serial No', type: 'text' },
    { key: 'powerRating', label: 'Power Rating', type: 'text', placeholder: 'e.g., 2000 KVA' },
    { key: 'voltageRatio', label: 'Voltage Ratio', type: 'text', placeholder: 'e.g., 20 kV / 0,4 kV' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'manufacture', label: 'Manufacture', type: 'text' },
    { key: 'oilBrand', label: 'Oil Brand', type: 'text' },
    { key: 'weightVolumeOil', label: 'Weight/Volume Oil', type: 'text', placeholder: 'e.g., 1000 Kg' },
    { key: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2016' },
    { key: 'temperature', label: 'Temperature', type: 'text', placeholder: 'e.g., 30°C' },
    { key: 'samplingPoint', label: 'Sampling Point', type: 'text', placeholder: 'e.g., Bottom' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Assignment className="w-6 h-6 text-primary-accent mr-3" />
                <h3 className="text-xl font-bold">Report Header Information</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {formFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.key as keyof ReportHeader]}
                      onChange={(e) => handleInputChange(field.key as keyof ReportHeader, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t">
                <Button type="submit" variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan & Lanjut Export
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportHeaderModal; 