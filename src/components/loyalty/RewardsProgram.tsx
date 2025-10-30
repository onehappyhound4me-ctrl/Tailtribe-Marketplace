'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UserRewards {
  totalPoints: number
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  lifetimeBookings: number
  pointsToNextTier: number
  availableRewards: Reward[]
  rewardHistory: RewardHistory[]
}

interface Reward {
  id: string
  title: string
  description: string
  pointsCost: number
  category: 'discount' | 'service' | 'premium' | 'gift'
  icon: string
  available: boolean
  expiresAt?: Date
}

interface RewardHistory {
  id: string
  reward: string
  pointsUsed: number
  redeemedAt: Date
  status: 'active' | 'used' | 'expired'
}

const mockUserRewards: UserRewards = {
  totalPoints: 1250,
  currentTier: 'silver',
  lifetimeBookings: 15,
  pointsToNextTier: 750,
  availableRewards: [
    {
      id: '1',
      title: '10% Korting',
      description: 'Korting op je volgende boeking',
      pointsCost: 500,
      category: 'discount',
      icon: '💰',
      available: true
    },
    {
      id: '2',
      title: 'Gratis Hondenuitlaat',
      description: 'Eén gratis wandeling van 30 minuten',
      pointsCost: 800,
      category: 'service',
      icon: '🚶',
      available: true
    },
    {
      id: '3',
      title: 'Premium Support',
      description: '24/7 prioriteit klantenservice voor 1 maand',
      pointsCost: 1200,
      category: 'premium',
      icon: '⭐',
      available: true
    },
    {
      id: '4',
      title: 'TailTribe Merchandise',
      description: 'Exclusieve TailTribe hondenlijn en speelgoed',
      pointsCost: 2000,
      category: 'gift',
      icon: '🎁',
      available: false
    }
  ],
  rewardHistory: [
    {
      id: '1',
      reward: '5% Korting op Dierenoppas',
      pointsUsed: 300,
      redeemedAt: new Date('2024-01-15'),
      status: 'used'
    },
    {
      id: '2',
      reward: 'Gratis Foto Update',
      pointsUsed: 200,
      redeemedAt: new Date('2024-01-10'),
      status: 'active'
    }
  ]
}

export function RewardsProgram() {
  const [userRewards, setUserRewards] = useState<UserRewards>(mockUserRewards)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const tierInfo = {
    bronze: { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', minPoints: 0 },
    silver: { name: 'Silver', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', minPoints: 500 },
    gold: { name: 'Gold', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', minPoints: 2000 },
    platinum: { name: 'Platinum', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', minPoints: 5000 }
  }

  const categories = [
    { id: 'all', label: 'Alle beloningen', icon: '🎯' },
    { id: 'discount', label: 'Kortingen', icon: '💰' },
    { id: 'service', label: 'Gratis Services', icon: '🎁' },
    { id: 'premium', label: 'Premium', icon: '⭐' },
    { id: 'gift', label: 'Cadeaus', icon: '🛍️' }
  ]

  const filteredRewards = selectedCategory === 'all' 
    ? userRewards.availableRewards 
    : userRewards.availableRewards.filter(reward => reward.category === selectedCategory)

  const handleRedeemReward = (rewardId: string) => {
    const reward = userRewards.availableRewards.find(r => r.id === rewardId)
    if (!reward || userRewards.totalPoints < reward.pointsCost) return

    // Simulate reward redemption
    setUserRewards(prev => ({
      ...prev,
      totalPoints: prev.totalPoints - reward.pointsCost,
      rewardHistory: [
        {
          id: Date.now().toString(),
          reward: reward.title,
          pointsUsed: reward.pointsCost,
          redeemedAt: new Date(),
          status: 'active'
        },
        ...prev.rewardHistory
      ]
    }))

    // Show success message (in real app, would use toast)
    alert(`🎉 Beloning "${reward.title}" succesvol ingewisseld!`)
  }

  const currentTierInfo = tierInfo[userRewards.currentTier]
  const progressPercentage = Math.min(
    ((userRewards.totalPoints - currentTierInfo.minPoints) / userRewards.pointsToNextTier) * 100,
    100
  )

  return (
    <div className="space-y-6">
      {/* Tier Status Card */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">TailTribe Rewards</h2>
              <p className="text-gray-600 font-normal">Verdien punten en ontvang geweldige beloningen</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${currentTierInfo.bg} ${currentTierInfo.border} border-2`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${currentTierInfo.color} mb-1`}>
                  {userRewards.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Beschikbare Punten</div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {currentTierInfo.name}
                </div>
                <div className="text-sm text-gray-600">Huidige Status</div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {userRewards.lifetimeBookings}
                </div>
                <div className="text-sm text-gray-600">Totaal Boekingen</div>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {userRewards.currentTier !== 'platinum' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Voortgang naar {tierInfo[userRewards.currentTier === 'bronze' ? 'silver' : userRewards.currentTier === 'silver' ? 'gold' : 'platinum'].name}
                </span>
                <span className="text-sm text-gray-500">
                  {userRewards.pointsToNextTier} punten nodig
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* How to Earn Points */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Hoe verdien je punten?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">📅</span>
                <span>Elke boeking: <strong>50 punten</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">⭐</span>
                <span>Review schrijven: <strong>25 punten</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">👥</span>
                <span>Vriend doorverwijzen: <strong>200 punten</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">🎂</span>
                <span>Verjaardag bonus: <strong>100 punten</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎁 Beschikbare Beloningen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  reward.available && userRewards.totalPoints >= reward.pointsCost
                    ? 'border-green-200 bg-green-50 hover:shadow-md hover:scale-105'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{reward.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                  </div>
                  <Badge 
                    className={`${
                      reward.available && userRewards.totalPoints >= reward.pointsCost
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {reward.pointsCost} punten
                  </Badge>
                </div>

                <Button
                  onClick={() => handleRedeemReward(reward.id)}
                  disabled={!reward.available || userRewards.totalPoints < reward.pointsCost}
                  className={`w-full ${
                    reward.available && userRewards.totalPoints >= reward.pointsCost
                      ? 'gradient-button'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {userRewards.totalPoints >= reward.pointsCost
                    ? reward.available 
                      ? '🎁 Inwisselen' 
                      : '⏳ Binnenkort beschikbaar'
                    : `❌ ${reward.pointsCost - userRewards.totalPoints} punten tekort`
                  }
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📜 Beloning Geschiedenis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRewards.rewardHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nog geen beloningen ingewisseld
              </h3>
              <p className="text-gray-600">
                Begin met het verdienen van punten om geweldige beloningen te ontgrendelen!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userRewards.rewardHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <div className="font-medium text-gray-900">{history.reward}</div>
                      <div className="text-sm text-gray-500">
                        {history.redeemedAt.toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">-{history.pointsUsed} punten</div>
                    <Badge 
                      className={
                        history.status === 'active' ? 'bg-green-100 text-green-800' :
                        history.status === 'used' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {history.status === 'active' ? 'Actief' :
                       history.status === 'used' ? 'Gebruikt' : 'Verlopen'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
