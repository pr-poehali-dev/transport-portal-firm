import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import DateInput from '@/components/ui/date-input';
import Icon from '@/components/ui/icon';

interface Waypoint {
  id: string;
  waypoint_order: number;
  location: string;
  waypoint_type: 'loading' | 'unloading';
  notes: string;
}

interface Customs {
  id: string;
  customs_name: string;
}

interface Stage {
  id: string;
  stage_number: number;
  from_location: string;
  to_location: string;
  planned_departure: string;
  vehicle_id: string;
  driver_id: string;
  driver_phone: string;
  driver_additional_phone: string;
  customs: Customs[];
  waypoints: Waypoint[];
  notes: string;
  saved?: boolean;
  started?: boolean;
}

interface OrderStageCardProps {
  stage: Stage;
  idx: number;
  vehicles: any[];
  drivers: any[];
  errors: Record<string, string>;
  vehicleSearchOpen: Record<string, boolean>;
  vehicleSearchQuery: Record<string, string>;
  onUpdateStage: (id: string, field: keyof Stage, value: string) => void;
  onDeleteStage: (id: string) => void;
  onAddWaypoint: (stageId: string) => void;
  onRemoveWaypoint: (stageId: string, waypointId: string) => void;
  onUpdateWaypoint: (stageId: string, waypointId: string, field: keyof Waypoint, value: any) => void;
  onAddCustoms: (stageId: string) => void;
  onRemoveCustoms: (stageId: string, customsId: string) => void;
  onUpdateCustoms: (stageId: string, customsId: string, value: string) => void;
  onVehicleSearchOpenChange: (stageId: string, open: boolean) => void;
  onVehicleSearchQueryChange: (stageId: string, query: string) => void;
}

export default function OrderStageCard({
  stage,
  idx,
  vehicles,
  drivers,
  errors,
  vehicleSearchOpen,
  vehicleSearchQuery,
  onUpdateStage,
  onDeleteStage,
  onAddWaypoint,
  onRemoveWaypoint,
  onUpdateWaypoint,
  onAddCustoms,
  onRemoveCustoms,
  onUpdateCustoms,
  onVehicleSearchOpenChange,
  onVehicleSearchQueryChange
}: OrderStageCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-base">Маршрут {stage.stage_number}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDeleteStage(stage.id)}
          className="text-red-500"
          disabled={stage.started}
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Дата погрузки *</Label>
            <DateInput
              value={stage.planned_departure}
              onChange={(value) => onUpdateStage(stage.id, 'planned_departure', value)}
              disabled={stage.started}
              className={errors[`stage_${idx}_date`] ? 'border-red-500' : ''}
            />
            {errors[`stage_${idx}_date`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_date`]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Откуда *</Label>
              <Input
                value={stage.from_location}
                onChange={(e) => onUpdateStage(stage.id, 'from_location', e.target.value)}
                className={errors[`stage_${idx}_from`] ? 'border-red-500' : ''}
                placeholder="Москва"
              />
              {errors[`stage_${idx}_from`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_from`]}</p>}
            </div>

            <div>
              <Label className="text-sm">Куда *</Label>
              <Input
                value={stage.to_location}
                onChange={(e) => onUpdateStage(stage.id, 'to_location', e.target.value)}
                className={errors[`stage_${idx}_to`] ? 'border-red-500' : ''}
                placeholder="Санкт-Петербург"
              />
              {errors[`stage_${idx}_to`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_to`]}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Промежуточные точки погрузки/разгрузки</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddWaypoint(stage.id)}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить
              </Button>
            </div>
            {stage.waypoints.length > 0 && (
              <div className="space-y-2">
                {stage.waypoints.map((waypoint) => (
                  <div key={waypoint.id} className="p-3 border rounded-lg space-y-3 bg-gray-50">
                    <div className="flex gap-2 items-start">
                      <div className="w-40">
                        <Label className="text-xs mb-1 block">Тип</Label>
                        <Select 
                          value={waypoint.waypoint_type} 
                          onValueChange={(val) => onUpdateWaypoint(stage.id, waypoint.id, 'waypoint_type', val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="loading">Погрузка</SelectItem>
                            <SelectItem value="unloading">Разгрузка</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs mb-1 block">Город</Label>
                        <Input
                          value={waypoint.location}
                          onChange={(e) => onUpdateWaypoint(stage.id, waypoint.id, 'location', e.target.value)}
                          placeholder="Название города"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveWaypoint(stage.id, waypoint.id)}
                        className="mt-5"
                      >
                        <Icon name="Trash2" size={16} className="text-red-500" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Примечание</Label>
                      <Input
                        value={waypoint.notes}
                        onChange={(e) => onUpdateWaypoint(stage.id, waypoint.id, 'notes', e.target.value)}
                        placeholder="Доп. информация"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {stage.waypoints.length === 0 && (
              <p className="text-sm text-gray-500 italic">Промежуточные точки не добавлены</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Таможня</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddCustoms(stage.id)}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить
              </Button>
            </div>
            {stage.customs.length > 0 && (
              <div className="space-y-2">
                {stage.customs.map((customs) => (
                  <div key={customs.id} className="flex gap-2 items-center">
                    <Input
                      value={customs.customs_name}
                      onChange={(e) => onUpdateCustoms(stage.id, customs.id, e.target.value)}
                      placeholder="Торфяновка"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveCustoms(stage.id, customs.id)}
                    >
                      <Icon name="Trash2" size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {stage.customs.length === 0 && (
              <p className="text-sm text-gray-500 italic">Таможня не добавлена</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Автомобиль *</Label>
              <Popover open={vehicleSearchOpen[stage.id]} onOpenChange={(open) => onVehicleSearchOpenChange(stage.id, open)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`w-full justify-between ${errors[`stage_${idx}_vehicle`] ? 'border-red-500' : ''}`}
                  >
                    {stage.vehicle_id ? (() => {
                      const vehicle = vehicles.find(v => v.id.toString() === stage.vehicle_id);
                      if (!vehicle) return 'Выберите автомобиль';
                      const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                      return `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`;
                    })() : 'Выберите автомобиль'}
                    <Icon name="ChevronsUpDown" size={16} className="ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Поиск автомобиля..."
                      value={vehicleSearchQuery[stage.id] || ''}
                      onChange={(e) => onVehicleSearchQueryChange(stage.id, e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {vehicles
                      .filter(vehicle => {
                        const query = (vehicleSearchQuery[stage.id] || '').toLowerCase();
                        if (!query) return true;
                        const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                        const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`.toLowerCase();
                        return displayText.includes(query);
                      })
                      .map((vehicle) => {
                        const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                        const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`;
                        const isSelected = stage.vehicle_id === vehicle.id.toString();
                        return (
                          <div
                            key={vehicle.id}
                            onClick={() => {
                              onUpdateStage(stage.id, 'vehicle_id', vehicle.id.toString());
                              onVehicleSearchOpenChange(stage.id, false);
                            }}
                            className={`flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent ${
                              isSelected ? 'bg-accent' : ''
                            }`}
                          >
                            <Icon 
                              name="Check" 
                              size={16}
                              className={`mr-2 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                            />
                            {displayText}
                          </div>
                        );
                      })}
                    {vehicles.filter(vehicle => {
                      const query = (vehicleSearchQuery[stage.id] || '').toLowerCase();
                      if (!query) return false;
                      const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                      const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`.toLowerCase();
                      return displayText.includes(query);
                    }).length === 0 && vehicleSearchQuery[stage.id] && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Автомобиль не найден
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors[`stage_${idx}_vehicle`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_vehicle`]}</p>}
            </div>

            <div>
              <Label className="text-sm">Водитель *</Label>
              <Input
                value={stage.driver_id ? (() => {
                  const driver = drivers.find(d => d.id === parseInt(stage.driver_id));
                  return driver ? `${driver.last_name} ${driver.first_name} ${driver.middle_name}`.trim() : '';
                })() : ''}
                disabled
                placeholder="Автоматически"
                className="bg-gray-50"
              />
              {errors[`stage_${idx}_driver`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_driver`]}</p>}
            </div>

            <div>
              <Label className="text-sm">Телефон водителя</Label>
              <Input
                value={stage.driver_phone}
                disabled
                placeholder="Автоматически"
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label className="text-sm">Доп. телефон водителя</Label>
              <Input
                value={stage.driver_additional_phone}
                disabled
                placeholder="Автоматически"
                className="bg-gray-50"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Примечание к маршруту</Label>
            <Textarea
              value={stage.notes}
              onChange={(e) => onUpdateStage(stage.id, 'notes', e.target.value)}
              placeholder="Дополнительная информация о маршруте..."
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
