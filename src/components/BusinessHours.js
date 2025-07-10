// ==================================================================
// Ficheiro: src/components/BusinessHours.js editado por vinicius
// ==================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  Coffee, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useData } from '../contexts/DataContext';

const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Segunda-feira', short: 'Seg' },
    { id: 2, name: 'Terça-feira', short: 'Ter' },
    { id: 3, name: 'Quarta-feira', short: 'Qua' },
    { id: 4, name: 'Quinta-feira', short: 'Qui' },
    { id: 5, name: 'Sexta-feira', short: 'Sex' },
    { id: 6, name: 'Sábado', short: 'Sáb' }
  ];

export function BusinessHours() {
  const { tenant } = useData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessHours, setBusinessHours] = useState([]);
  const [bookingSettings, setBookingSettings] = useState({
    slot_duration: 30,
    buffer_time: 0,
    advance_booking_days: 30,
    min_advance_hours: 24,
    max_bookings_per_day: null,
    allow_multiple_bookings: false
  });
  const [specialDays, setSpecialDays] = useState([]);
  const [notification, setNotification] = useState(null);
  
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);
  
  const fetchBusinessData = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar horários
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('day_of_week');

      if (hoursData && hoursData.length > 0) {
        setBusinessHours(hoursData);
      } else {
        // Criar estrutura padrão se não existir
        setBusinessHours(daysOfWeek.map(day => ({
          day_of_week: day.id,
          is_open: day.id >= 1 && day.id <= 5, // Segunda a Sexta aberto
          open_time: '09:00',
          close_time: day.id === 6 ? '13:00' : '18:00',
          break_start: day.id >= 1 && day.id <= 5 ? '13:00' : null,
          break_end: day.id >= 1 && day.id <= 5 ? '14:00' : null
        })));
      }

      // Buscar configurações
      const { data: settingsData } = await supabase
        .from('booking_settings')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

      if (settingsData) {
        setBookingSettings(settingsData);
      }

      // Buscar dias especiais
      const { data: specialData } = await supabase
        .from('special_days')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      setSpecialDays(specialData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      showNotification('Erro ao carregar horários', 'error');
    } finally {
      setLoading(false);
    }
  }, [tenant, showNotification]);
  
  useEffect(() => {
    if (tenant?.id) {
      fetchBusinessData();
    }
  }, [tenant, fetchBusinessData]);
  
  const handleDayToggle = (dayIndex) => {
    setBusinessHours(prev => prev.map((hour, idx) => 
      idx === dayIndex ? { ...hour, is_open: !hour.is_open } : hour
    ));
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setBusinessHours(prev => prev.map((hour, idx) => 
      idx === dayIndex ? { ...hour, [field]: value } : hour
    ));
  };

  const handleSettingChange = (field, value) => {
    setBookingSettings(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialDay = () => {
    const newSpecialDay = {
      id: `temp-${Date.now()}`,
      date: '',
      is_closed: true,
      reason: '',
      isNew: true
    };
    setSpecialDays(prev => [...prev, newSpecialDay]);
  };

  const removeSpecialDay = (id) => {
    setSpecialDays(prev => prev.filter(day => day.id !== id));
  };

  const updateSpecialDay = (id, field, value) => {
    setSpecialDays(prev => prev.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardar horários
      for (const hour of businessHours) {
        await supabase
          .from('business_hours')
          .upsert({
            tenant_id: tenant.id,
            ...hour
          }, {
            onConflict: 'tenant_id,day_of_week'
          });
      }

      // Guardar configurações
      await supabase
        .from('booking_settings')
        .upsert({
          tenant_id: tenant.id,
          ...bookingSettings
        }, {
          onConflict: 'tenant_id'
        });

      // Guardar dias especiais
      for (const day of specialDays) {
        if (day.date && !day.isDeleted) {
          const { isNew, ...dayData } = day;
          await supabase
            .from('special_days')
            .upsert({
              tenant_id: tenant.id,
              ...dayData
            }, {
              onConflict: 'tenant_id,date'
            });
        }
      }

      showNotification('Horários guardados com sucesso!');
    } catch (error) {
      console.error('Erro ao guardar:', error);
      showNotification('Erro ao guardar horários', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Horários de Funcionamento</h2>
        <p className="text-muted-foreground mt-1">Configure os horários e regras de agendamento do seu negócio</p>
      </div>

      {/* Notificação */}
      {notification && (
        <div className={`p-4 rounded-md flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5 mr-3" /> 
            : <AlertCircle className="w-5 h-5 mr-3" />
          }
          {notification.message}
        </div>
      )}

      {/* Horários por dia da semana */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Horário Semanal
        </h3>

        <div className="space-y-4">
          {businessHours.map((hour, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 bg-muted rounded-md">
              {/* Dia da semana */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={hour.is_open}
                  onChange={() => handleDayToggle(index)}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
                <label className="font-medium text-foreground">
                  {daysOfWeek[index].name}
                </label>
              </div>

              {/* Horários */}
              {hour.is_open ? (
                <>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Abertura</label>
                    <input
                      type="time"
                      value={hour.open_time || ''}
                      onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Fecho</label>
                    <input
                      type="time"
                      value={hour.close_time || ''}
                      onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={hour.break_start || ''}
                      onChange={(e) => handleTimeChange(index, 'break_start', e.target.value)}
                      placeholder="Início pausa"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="time"
                      value={hour.break_end || ''}
                      onChange={(e) => handleTimeChange(index, 'break_end', e.target.value)}
                      placeholder="Fim pausa"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => {
                        handleTimeChange(index, 'break_start', null);
                        handleTimeChange(index, 'break_end', null);
                      }}
                      className="text-sm text-muted-foreground hover:text-destructive"
                    >
                      Sem pausa
                    </button>
                  </div>
                </>
              ) : (
                <div className="md:col-span-5 text-muted-foreground italic">Fechado</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configurações de Agendamento */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Regras de Agendamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Duração padrão dos serviços (minutos)
            </label>
            <input
              type="number"
              value={bookingSettings.slot_duration}
              onChange={(e) => handleSettingChange('slot_duration', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              min="15"
              step="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tempo entre marcações (minutos)
            </label>
            <input
              type="number"
              value={bookingSettings.buffer_time}
              onChange={(e) => handleSettingChange('buffer_time', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              min="0"
              step="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Antecedência máxima (dias)
            </label>
            <input
              type="number"
              value={bookingSettings.advance_booking_days}
              onChange={(e) => handleSettingChange('advance_booking_days', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Antecedência mínima (horas)
            </label>
            <input
              type="number"
              value={bookingSettings.min_advance_hours}
              onChange={(e) => handleSettingChange('min_advance_hours', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Máximo de marcações por dia
            </label>
            <input
              type="number"
              value={bookingSettings.max_bookings_per_day || ''}
              onChange={(e) => handleSettingChange('max_bookings_per_day', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              placeholder="Sem limite"
              min="1"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="multiple-bookings"
              checked={bookingSettings.allow_multiple_bookings}
              onChange={(e) => handleSettingChange('allow_multiple_bookings', e.target.checked)}
              className="w-5 h-5 text-primary rounded focus:ring-ring"
            />
            <label htmlFor="multiple-bookings" className="text-sm font-medium text-foreground">
              Permitir marcações simultâneas
            </label>
          </div>
        </div>
      </div>

      {/* Dias Especiais */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Dias Especiais (Feriados, Férias, etc)
          </h3>
          <button
            onClick={addSpecialDay}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </button>
        </div>

        {specialDays.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum dia especial configurado
          </p>
        ) : (
          <div className="space-y-3">
            {specialDays.map((day) => (
              <div key={day.id} className="flex items-center space-x-4 p-4 bg-muted rounded-md">
                <input
                  type="date"
                  value={day.date || ''}
                  onChange={(e) => updateSpecialDay(day.id, 'date', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                  min={new Date().toISOString().split('T')[0]}
                />

                <input
                  type="text"
                  value={day.reason || ''}
                  onChange={(e) => updateSpecialDay(day.id, 'reason', e.target.value)}
                  placeholder="Motivo (ex: Feriado Nacional)"
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                />

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={day.is_closed}
                    onChange={(e) => updateSpecialDay(day.id, 'is_closed', e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">Fechado</span>
                </label>

                <button
                  onClick={() => removeSpecialDay(day.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Guardar Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
}
