"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Shield, User, Menu, X } from "lucide-react"

interface ProjectWeights {
  experience: number
  reviews: number
  rating: number
  price: number
  speed: number
}

interface RawWeights {
  experience: number
  reviews: number
  rating: number
  price: number
  speed: number
}

interface Contractor {
  name: string
  title: string
  vertical: string
  years_in_business: number
  rating: number
  review_count: number
  service_area: string
  pricing_band: string
  licenses: string[]
  flags: string[]
  trustScore: number
  distance: string
  services: string[]
  aiSummary: string
  profileImage?: string
  description: string
}

// API Response interfaces
interface ApiContractor {
  id: string
  name: string
  vertical: string
  years_in_business: number
  rating: number
  review_count: number
  service_area: string
  pricing_band: string
  speed_weeks: number
  licenses: string[]
  flags: string[]
  score: number
  reasoning?: string
}

interface ApiResponse {
  top_contractors: ApiContractor[]
}

const mockContractors: Contractor[] = [
  {
    name: "Sarah Johnson",
    title: "Contractor",
    vertical: "roofing",
    years_in_business: 8,
    rating: 4.2,
    review_count: 23,
    service_area: "Salt Lake City",
    pricing_band: "$",
    licenses: ["UT-ROOF-12003"],
    flags: ["top_rated"],
    trustScore: 85,
    distance: "3.5 Miles Away",
    services: ["Roof Repair", "Roof Installation", "Gutter Services", "Emergency Repairs"],
    description:
      "Known for strong communication and detailed follow-up. Homeowners often highlight her responsiveness and ability to simplify complex roofing projects.",
    aiSummary:
      "This provider is highly rated for their reliability, timely service, and positive customer feedback. Based on your needs and community trust, they are an excellent match for you.",
  },
  {
    name: "James Mark",
    title: "Contractor",
    vertical: "roofing",
    years_in_business: 12,
    rating: 4.2,
    review_count: 23,
    service_area: "Salt Lake City",
    pricing_band: "$$",
    licenses: ["UT-ROOF-08901", "UT-GEN-15432"],
    flags: ["licensed_bonded"],
    trustScore: 82,
    distance: "3.5 Miles Away",
    services: ["Roof Repair", "Roof Installation", "Solar Integration", "Warranty Services"],
    description:
      "Rated highly for balancing value and quality. Clients point to his reliable scheduling and clear explanations that keep projects on track.",
    aiSummary:
      "This provider is highly rated for their reliability, timely service, and positive customer feedback. Based on your needs and community trust, they are an excellent match for you.",
  },
  {
    name: "Vicks Johnny",
    title: "Contractor",
    vertical: "roofing",
    years_in_business: 15,
    rating: 4.2,
    review_count: 23,
    service_area: "Salt Lake City",
    pricing_band: "$$",
    licenses: ["UT-ROOF-09876"],
    flags: ["eco_friendly", "warranty_plus"],
    trustScore: 75,
    distance: "3.5 Miles Away",
    services: ["Roof Repair", "Eco Solutions", "Budget Options", "Flexible Scheduling"],
    description:
      "Appreciated for hands-on support and flexible solutions. Often chosen by homeowners prioritizing personal attention and budget-friendly options.",
    aiSummary:
      "This provider is highly rated for their reliability, timely service, and positive customer feedback. Based on your needs and community trust, they are an excellent match for you.",
  },
]

export default function HomeRepairApp() {
  const [currentScreen, setCurrentScreen] = useState<"search" | "loading" | "results">("search")
  const [city, setCity] = useState("")
  const [projectType, setProjectType] = useState("")
  const [notes, setNotes] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [apiContractors, setApiContractors] = useState<ApiContractor[]>([])
  const [error, setError] = useState<string>("")
  // Raw weights (0-100 scale, user-friendly)
  const [rawWeights, setRawWeights] = useState<RawWeights>({
    experience: 40,
    reviews: 25,
    rating: 20,
    price: 10,
    speed: 5,
  })

  // Normalized weights for API (0-1 scale)
  const getNormalizedWeights = (): ProjectWeights => {
    const total = Object.values(rawWeights).reduce((sum, val) => sum + val, 0)
    if (total === 0) {
      // If all are 0, distribute evenly
      return {
        experience: 0.2,
        reviews: 0.2,
        rating: 0.2,
        price: 0.2,
        speed: 0.2,
      }
    }
    return {
      experience: rawWeights.experience / total,
      reviews: rawWeights.reviews / total,
      rating: rawWeights.rating / total,
      price: rawWeights.price / total,
      speed: rawWeights.speed / total,
    }
  }

  // Get normalized percentages for display (ensures total = 100%)
  const getNormalizedPercentages = () => {
    const normalized = getNormalizedWeights()
    const keys: (keyof ProjectWeights)[] = ['experience', 'reviews', 'rating', 'price', 'speed']
    
    // Calculate exact percentages
    const exactPercentages = keys.map(key => normalized[key] * 100)
    
    // Floor all values and calculate remainders
    const flooredPercentages = exactPercentages.map(Math.floor)
    const remainders = exactPercentages.map((exact, i) => exact - flooredPercentages[i])
    
    // Calculate how many we need to round up to reach 100%
    const currentTotal = flooredPercentages.reduce((sum, val) => sum + val, 0)
    const roundUpCount = 100 - currentTotal
    
    // Sort by remainder (largest first) and round up the top ones
    const indexedRemainders = remainders.map((remainder, index) => ({ remainder, index }))
    indexedRemainders.sort((a, b) => b.remainder - a.remainder)
    
    const finalPercentages = [...flooredPercentages]
    for (let i = 0; i < roundUpCount; i++) {
      finalPercentages[indexedRemainders[i].index] += 1
    }
    
    return {
      experience: finalPercentages[0],
      reviews: finalPercentages[1],
      rating: finalPercentages[2],
      price: finalPercentages[3],
      speed: finalPercentages[4],
    }
  }

  const handleSearch = async () => {
    if (city && projectType) {
      setCurrentScreen("loading")
      setError("")
      
      try {
        const response = await fetch("http://localhost:8000/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city,
            project_type: projectType,
            notes,
            weights: getNormalizedWeights(),
          }),
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data: ApiResponse = await response.json()
        setApiContractors(data.top_contractors)
        setCurrentScreen("results")
      } catch (err) {
        console.error("API Error:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch contractors")
        setCurrentScreen("search")
      }
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  const getPricingDisplay = (band: string) => {
    const symbols = { $: "$", $$: "$$", $$$: "$$$" }
    return symbols[band as keyof typeof symbols] || band
  }

  // Map API contractor data to display format
  const getContractorDetails = (apiContractor: ApiContractor): Contractor => {
    // Use real API data and supplement with display-friendly info
    return {
      name: apiContractor.name,
      title: "Contractor", // Generic title
      vertical: apiContractor.vertical,
      years_in_business: apiContractor.years_in_business,
      rating: apiContractor.rating,
      review_count: apiContractor.review_count,
      service_area: apiContractor.service_area,
      pricing_band: apiContractor.pricing_band,
      licenses: apiContractor.licenses,
      flags: apiContractor.flags,
      trustScore: Math.round(apiContractor.score), // Use API score as trust score
      distance: "3.5 Miles Away", // Default distance for display
      services: ["Repair Services", "Installation", "Consultation", "Emergency Repairs"], // Default services
      aiSummary: apiContractor.reasoning || "This contractor has been selected based on your preferences and requirements.",
      description: `Experienced ${apiContractor.vertical} contractor with ${apiContractor.years_in_business} years in business. ${apiContractor.rating}/5 rating based on ${apiContractor.review_count} reviews.`,
      profileImage: undefined, // No profile image from API
    }
  }

  const updateRawWeight = (key: keyof RawWeights, newValue: number) => {
    setRawWeights({
      ...rawWeights,
      [key]: newValue,
    })
  }

  // Preset weight configurations
  const applyPreset = (presetName: string) => {
    const presets = {
      balanced: { experience: 20, reviews: 20, rating: 20, price: 20, speed: 20 },
      quality_focused: { experience: 35, reviews: 25, rating: 25, price: 10, speed: 5 },
      budget_focused: { experience: 15, reviews: 15, rating: 15, price: 40, speed: 15 },
      speed_focused: { experience: 20, reviews: 15, rating: 15, price: 15, speed: 35 },
    }
    setRawWeights(presets[presetName as keyof typeof presets] || presets.balanced)
  }

  const Header = () => (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900">HomeRepair</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer">Explore</span>
            <span className="hover:text-gray-900 cursor-pointer">My Favourites</span>
            <span className="hover:text-gray-900 cursor-pointer">My Reviews</span>
            <span className="hover:text-gray-900 cursor-pointer">My Appointments</span>
            <span className="hover:text-gray-900 cursor-pointer">Post a Need</span>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-transparent text-xs lg:text-sm px-2 lg:px-4">
              Join as a Contractor
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-3 text-sm text-gray-600">
              <span className="hover:text-gray-900 cursor-pointer py-2">Explore</span>
              <span className="hover:text-gray-900 cursor-pointer py-2">My Favourites</span>
              <span className="hover:text-gray-900 cursor-pointer py-2">My Reviews</span>
              <span className="hover:text-gray-900 cursor-pointer py-2">My Appointments</span>
              <span className="hover:text-gray-900 cursor-pointer py-2">Post a Need</span>
              <Button variant="outline" size="sm" className="bg-transparent mt-2 self-start">
                Join as a Contractor
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )

  if (currentScreen === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Scanning animation circles */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-ping"></div>
                <div className="absolute inset-4 border-4 border-blue-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">AI</span>
                  </div>
                </div>

                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                  <div
                    className="absolute top-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute top-8 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                  ></div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Analyzing Your Request with AI</h2>
              <p className="text-gray-600 text-base sm:text-lg mb-6">
                We're matching you with the best contractors based on your preferences...
              </p>

              {/* Progress indicators */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Scanning contractor database</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <span className="text-sm text-gray-600">Analyzing reviews and ratings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: "2s" }}
                  ></div>
                  <span className="text-sm text-gray-600">Calculating trust scores</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: "3s" }}
                  ></div>
                  <span className="text-sm text-gray-600">Ranking best matches</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "search") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Contractor</h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Connect with trusted professionals for your home repair needs
            </p>
          </div>

          <Card className="shadow-sm bg-white border border-gray-200">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl text-gray-900">Tell us about your project</CardTitle>
              <CardDescription className="text-gray-600">
                We'll match you with the best contractors in your area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-900 font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
                {error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-type" className="text-gray-900 font-medium">
                  Project Type
                </Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus-visible:ring-blue-500 focus-visible:border-blue-500">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="[&_[data-highlighted]]:bg-blue-50 [&_[data-highlighted]]:text-blue-900">
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="flooring">Flooring</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-900 font-medium">
                  Project Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your project in detail..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold text-gray-900">What matters most to you?</Label>
                  <span className="text-sm text-gray-500">
                    Final: {Object.values(getNormalizedPercentages()).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="mb-4 space-y-2">
                  <Label className="text-sm text-gray-600">Quick presets:</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("balanced")}
                      className="text-xs"
                    >
                      🎯 Balanced
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("quality_focused")}
                      className="text-xs"
                    >
                      ⭐ Quality First
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("budget_focused")}
                      className="text-xs"
                    >
                      💰 Budget Focus
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("speed_focused")}
                      className="text-xs"
                    >
                      ⚡ Speed Focus
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Experience</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">{rawWeights.experience}</span>
                        <span className="text-xs text-gray-500">({getNormalizedPercentages().experience}%)</span>
                      </div>
                    </div>
                    <Slider
                      value={[rawWeights.experience]}
                      onValueChange={([value]) => updateRawWeight("experience", value)}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.bg-primary]:bg-blue-600 [&_[role=slider]]:focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Reviews</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">{rawWeights.reviews}</span>
                        <span className="text-xs text-gray-500">({getNormalizedPercentages().reviews}%)</span>
                      </div>
                    </div>
                    <Slider
                      value={[rawWeights.reviews]}
                      onValueChange={([value]) => updateRawWeight("reviews", value)}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.bg-primary]:bg-blue-600 [&_[role=slider]]:focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Rating</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">{rawWeights.rating}</span>
                        <span className="text-xs text-gray-500">({getNormalizedPercentages().rating}%)</span>
                      </div>
                    </div>
                    <Slider
                      value={[rawWeights.rating]}
                      onValueChange={([value]) => updateRawWeight("rating", value)}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.bg-primary]:bg-blue-600 [&_[role=slider]]:focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Price</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">{rawWeights.price}</span>
                        <span className="text-xs text-gray-500">({getNormalizedPercentages().price}%)</span>
                      </div>
                    </div>
                    <Slider
                      value={[rawWeights.price]}
                      onValueChange={([value]) => updateRawWeight("price", value)}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.bg-primary]:bg-blue-600 [&_[role=slider]]:focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Speed</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">{rawWeights.speed}</span>
                        <span className="text-xs text-gray-500">({getNormalizedPercentages().speed}%)</span>
                      </div>
                    </div>
                    <Slider
                      value={[rawWeights.speed]}
                      onValueChange={([value]) => updateRawWeight("speed", value)}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.bg-primary]:bg-blue-600 [&_[role=slider]]:focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!city || !projectType}
              >
                Find Contractors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trusted by HomeRepair</h1>
            <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
              Here are top three providers recommended first - chosen based on TrustScore, reviews, and community trust.
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent self-start sm:self-auto">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">HR Trust Map</span>
            <span className="sm:hidden">Trust Map</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {apiContractors.length > 0 ? apiContractors.map((apiContractor, index) => {
            const contractor = getContractorDetails(apiContractor)
            return (
            <Card
              key={apiContractor.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col"
                              style={{ minHeight: '700px' }}
            >
              <CardContent className="p-4 sm:p-6 flex flex-col h-full justify-between">
                <div className="flex-grow">
                  {/* Header Section - Fixed Height */}
                  <div className="flex items-start gap-4 mb-4" style={{ height: '80px' }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{contractor.name}</h3>
                      <p className="text-gray-600 text-sm">{contractor.title}</p>
                      {index === 0 && (
                        <div className="mt-1">
                          <span className="text-red-500">♥</span>
                        </div>
                      )}
                    </div>
                  </div>

                                                       {/* Summary Description - Fixed Height */}
                  <div className="mb-4" style={{ height: '44px' }}>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 h-full flex items-center">
                      {apiContractor.vertical.charAt(0).toUpperCase() + apiContractor.vertical.slice(1)} specialist serving {apiContractor.service_area}
                    </p>
                  </div>

                                                       {/* Final Score Section - Fixed Height */}
                  <div className="mb-4" style={{ height: '48px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Final Score:</span>
                      <span className="font-bold text-blue-600">{apiContractor.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(apiContractor.score, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                                                       {/* Contractor Details Grid - Fixed Height */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm" style={{ height: '100px' }}>
                    <div className="space-y-1 flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{apiContractor.rating}</span>
                        <span className="text-gray-500">({apiContractor.review_count})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{apiContractor.service_area}</span>
                      </div>
                      
                      <div className="text-gray-600">
                        <span className="font-medium">Experience:</span> {apiContractor.years_in_business}y
                      </div>
                      
                      <div className="text-gray-600">
                        <span className="font-medium">Speed:</span> {apiContractor.speed_weeks}w
                      </div>
                    </div>
                    
                    <div className="space-y-1 flex flex-col justify-between">
                      <div className="text-gray-600">
                        <span className="font-medium">Type:</span> <span className="capitalize">{apiContractor.vertical}</span>
                      </div>
                      
                      <div className="text-gray-600">
                        <span className="font-medium">Pricing:</span> {apiContractor.pricing_band || 'N/A'}
                      </div>
                      
                      <div className="text-gray-600">
                        <span className="font-medium">ID:</span> {apiContractor.id}
                      </div>
                      
                      <div></div> {/* Spacer for alignment */}
                    </div>
                  </div>

                                                       {/* Licenses Section - Fixed Height */}
                  <div className="mb-4" style={{ height: '60px' }}>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Licenses</h4>
                    <div className="flex flex-wrap gap-1 h-8 overflow-hidden">
                      {apiContractor.licenses && apiContractor.licenses.length > 0 ? (
                        apiContractor.licenses.map((license, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-green-50 text-green-700 border-green-200 h-6"
                          >
                            {license}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs flex items-center">No licenses listed</span>
                      )}
                    </div>
                  </div>

                                     {/* Flags Section - Fixed Height (Always Present) */}
                  <div className="mb-4" style={{ height: '60px' }}>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Flags</h4>
                    <div className="flex flex-wrap gap-1 h-8 overflow-hidden">
                      {apiContractor.flags && apiContractor.flags.length > 0 ? (
                        apiContractor.flags.map((flag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 h-6"
                          >
                            {flag.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs flex items-center">No flags</span>
                      )}
                    </div>
                  </div>

                                     {/* Services Section - Fixed Height */}
                  <div className="mb-4" style={{ height: '60px' }}>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Services</h4>
                    <div className="flex flex-wrap gap-1 h-8 overflow-hidden">
                      {contractor.services.slice(0, 2).map((service, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200 h-6"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                                                       {/* GPT Analysis Section - Fixed Height */}
                  <div className="mb-4" style={{ height: '100px' }}>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">GPT Analysis</h4>
                    <div className="h-20">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                        {apiContractor.reasoning || "AI analysis not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Button Section - Fixed Height at Bottom */}
                <div className="mt-auto pt-4" style={{ height: '56px' }}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">View profile</Button>
                </div>
              </CardContent>
            </Card>
          )
          }) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No contractors found. Please try a different search.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setCurrentScreen("search")}>
            ← New Search
          </Button>
        </div>
      </div>
    </div>
  )
}
