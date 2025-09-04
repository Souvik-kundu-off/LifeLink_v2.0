import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, MapPin, Phone, Clock, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Recipient, Match } from '../../types';
import { supabaseApi } from '../../utils/supabase/client';
import { transformArray, transformMatch } from '../../utils/dataTransforms';

interface MatchingEngineProps {
  recipients: Recipient[];
}

export default function MatchingEngine({ recipients }: MatchingEngineProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const activeRecipients = recipients.filter(r => r.status === 'waiting');

  const handleFindMatches = async () => {
    if (!selectedRecipient) return;

    setLoading(true);
    setSearchPerformed(false);
    
    try {
      const response = await supabaseApi.findMatches(selectedRecipient);
      const foundMatches = response.matches || [];
      // Transform the server response using our data transform utility
      const transformedMatches = transformArray(foundMatches, (match) => ({
        ...transformMatch(match),
        reason: match.reason || 'Blood type compatibility'
      }));
      setMatches(transformedMatches.sort((a, b) => b.matchScore - a.matchScore));
      setSearchPerformed(true);
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const selectedRecipientData = recipients.find(r => r.id === selectedRecipient);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Matching Engine</h2>
        <p className="text-gray-600">Find compatible donors for recipients using our advanced matching algorithm</p>
      </div>

      {/* Recipient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Find Compatible Blood Donors</span>
          </CardTitle>
          <CardDescription>
            Select a recipient to find the best matching blood donors based on blood type compatibility and proximity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Recipient</label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recipient to find matches for..." />
                </SelectTrigger>
                <SelectContent>
                  {activeRecipients.map(recipient => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{recipient.name}</span>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {recipient.bloodGroup}
                          </Badge>
                          {recipient.urgencyLevel === 'critical' && (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleFindMatches}
              disabled={!selectedRecipient || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Matches
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Recipient Info */}
      {selectedRecipientData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Recipient Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Patient</div>
                <div className="text-lg font-semibold">{selectedRecipientData.name}</div>
                <div className="text-sm text-gray-600">Age: {selectedRecipientData.age}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Requirements</div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="font-mono">
                    {selectedRecipientData.bloodGroup}
                  </Badge>
                  <Badge className={
                    selectedRecipientData.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedRecipientData.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedRecipientData.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {selectedRecipientData.urgencyLevel}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">Blood donation required</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Waiting Since</div>
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(selectedRecipientData.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {Math.floor((Date.now() - new Date(selectedRecipientData.registrationDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Matching Results</span>
              </div>
              <Badge variant="outline">
                {matches.length} matches found
              </Badge>
            </CardTitle>
            <CardDescription>
              Donors are ranked by compatibility score, distance, and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No compatible donors found for this recipient. Consider expanding search criteria or checking with other hospitals.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{matches.filter(m => m.matchScore >= 90).length}</div>
                    <div className="text-sm text-gray-600">Excellent Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{matches.filter(m => m.matchScore >= 75 && m.matchScore < 90).length}</div>
                    <div className="text-sm text-gray-600">Good Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(matches.reduce((sum, m) => sum + m.distance, 0) / matches.length)}</div>
                    <div className="text-sm text-gray-600">Avg Distance (km)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)}</div>
                    <div className="text-sm text-gray-600">Avg Match Score</div>
                  </div>
                </div>

                {/* Matches Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Donor ID</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Compatibility</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match, index) => (
                      <TableRow key={match.id} className={index === 0 ? 'bg-green-50' : ''}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-gold text-yellow-800 border-2 border-yellow-400' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-200 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            {index === 0 && <span className="text-xs text-yellow-600">Best Match</span>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{match.donorId}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16">
                              <Progress value={match.matchScore} className="h-2" />
                            </div>
                            <span className={`font-bold ${getMatchScoreColor(match.matchScore)}`}>
                              {match.matchScore}%
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getMatchScoreLabel(match.matchScore)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{match.distance} km</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{match.compatibility}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{match.reason}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Contact
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}