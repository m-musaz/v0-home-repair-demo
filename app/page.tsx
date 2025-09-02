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
import { Star, MapPin, Shield, User } from "lucide-react"

interface ProjectWeights {
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
  const [currentScreen, setCurrentScreen] = useState<"search" | "results">("search")
  const [city, setCity] = useState("")
  const [projectType, setProjectType] = useState("")
  const [notes, setNotes] = useState("")
  const [weights, setWeights] = useState<ProjectWeights>({
    experience: 0.4,
    reviews: 0.25,
    rating: 0.2,
    price: 0.1,
    speed: 0.05,
  })

  const handleSearch = () => {
    if (city && projectType) {
      setCurrentScreen("results")
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

  if (currentScreen === "search") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HR</span>
                </div>
                <span className="font-bold text-xl text-gray-900">HomeRepair</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <span>Explore</span>
                <span>My Favourites</span>
                <span>My Reviews</span>
                <span>My Appointments</span>
                <span>Post a Need</span>
              </nav>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                  Join as a Contractor
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-type" className="text-gray-900 font-medium">
                  Project Type
                </Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">What matters most to you?</Label>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Experience</Label>
                      <span className="text-sm text-gray-500">{Math.round(weights.experience * 100)}%</span>
                    </div>
                    <Slider
                      value={[weights.experience]}
                      onValueChange={([value]) => setWeights((prev) => ({ ...prev, experience: value }))}
                      max={1}
                      step={0.05}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Reviews</Label>
                      <span className="text-sm text-gray-500">{Math.round(weights.reviews * 100)}%</span>
                    </div>
                    <Slider
                      value={[weights.reviews]}
                      onValueChange={([value]) => setWeights((prev) => ({ ...prev, reviews: value }))}
                      max={1}
                      step={0.05}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Rating</Label>
                      <span className="text-sm text-gray-500">{Math.round(weights.rating * 100)}%</span>
                    </div>
                    <Slider
                      value={[weights.rating]}
                      onValueChange={([value]) => setWeights((prev) => ({ ...prev, rating: value }))}
                      max={1}
                      step={0.05}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Price</Label>
                      <span className="text-sm text-gray-500">{Math.round(weights.price * 100)}%</span>
                    </div>
                    <Slider
                      value={[weights.price]}
                      onValueChange={([value]) => setWeights((prev) => ({ ...prev, price: value }))}
                      max={1}
                      step={0.05}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-gray-700">Speed</Label>
                      <span className="text-sm text-gray-500">{Math.round(weights.speed * 100)}%</span>
                    </div>
                    <Slider
                      value={[weights.speed]}
                      onValueChange={([value]) => setWeights((prev) => ({ ...prev, speed: value }))}
                      max={1}
                      step={0.05}
                      className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
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
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="font-bold text-xl text-gray-900">HomeRepair</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <span>Explore</span>
              <span>My Favourites</span>
              <span>My Reviews</span>
              <span>My Appointments</span>
              <span>Post a Need</span>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                Join as a Contractor
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          {mockContractors.map((contractor, index) => (
            <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{contractor.name}</h3>
                    <p className="text-gray-600 text-sm">{contractor.title}</p>
                    {index === 0 && (
                      <div className="mt-1">
                        <span className="text-red-500">♥</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{contractor.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Trust Score:</span>
                    <span className="font-bold text-blue-600">{contractor.trustScore}%</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">({contractor.rating})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{contractor.review_count} Reviews</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{contractor.distance}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.services.slice(0, 2).map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{contractor.aiSummary}</p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View profile</Button>
              </CardContent>
            </Card>
          ))}
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
