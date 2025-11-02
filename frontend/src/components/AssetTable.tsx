import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Asset, AssetFilters, AssetStatus } from '@/types/asset';
import { StatusBadge } from './StatusBadge';
import { Mail, MessageSquare, Flag, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AssetTableProps {
  assets: Asset[];
  onUpdateStatus: (assetId: string, status: AssetStatus) => void;
  onDraftEmail: (asset: Asset) => void;
  onOpenChat: (asset: Asset) => void;
}

export const AssetTable = ({ assets, onUpdateStatus, onDraftEmail, onOpenChat }: AssetTableProps) => {
  const [filters, setFilters] = useState<AssetFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesLocation = !filters.location || asset.location === filters.location;
    const matchesOwner = !filters.owner || asset.owner === filters.owner;

    return matchesSearch && matchesStatus && matchesLocation && matchesOwner;
  });

  const uniqueLocations = Array.from(new Set(assets.map(a => a.location)));
  const uniqueOwners = Array.from(new Set(assets.map(a => a.owner)));

  const getDaysSinceLastSeen = (lastSeen: string) => {
    const days = Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-1"
          />
          
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => 
              setFilters({ ...filters, status: value === 'all' ? undefined : value as AssetStatus })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
              <SelectItem value="Recovered">Recovered</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.location || 'all'}
            onValueChange={(value) => 
              setFilters({ ...filters, location: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.owner || 'all'}
            onValueChange={(value) => 
              setFilters({ ...filters, owner: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {uniqueOwners.map(owner => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No assets found
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => {
                const daysSince = getDaysSinceLastSeen(asset.last_seen);
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.asset_id}</TableCell>
                    <TableCell>{asset.owner}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{asset.last_seen}</span>
                        <span className="text-xs text-muted-foreground">
                          {daysSince} days ago
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={asset.status} />
                    </TableCell>
                    <TableCell>${asset.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenChat(asset)}
                          title="Open Chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDraftEmail(asset)}
                          title="Draft Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        {asset.status !== 'Missing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus(asset.id, 'Missing')}
                            title="Flag as Missing"
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}
                        {asset.status === 'Missing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus(asset.id, 'Recovered')}
                            title="Mark Recovered"
                            className="text-success"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
