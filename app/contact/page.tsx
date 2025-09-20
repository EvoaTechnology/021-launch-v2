"use client"

import type React from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
	Mail,
	Phone,
	MessageSquare,
	HelpCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const contactMethods = [
	{
		title: "Email Support",
		description: "Get help via email within 24 hours",
		icon: Mail,
		contact: "connectevoa@gmail.com",
		availability: "24/7",
		color: "bg-gradient-to-br from-slate-500/80 via-slate-700/70 to-slate-600/60 text-white border-green-700",
	},
	{
		title: "Live Chat",
		description: "Chat with Ask 021 for instant assistance",
		icon: MessageSquare,
		contact: "Available in app",
		availability: "Always online",
		color: "bg-gradient-to-br from-slate-500/80 via-slate-700/70 to-slate-600/60 text-white border-green-700",
	},
	{
		title: "Phone Support",
		description: "Speak with our team directly",
		icon: Phone,
		contact: "+91 9636641861, 9759054403",
		availability: "Mon-Fri 9AM-6PM IST",
		color: "bg-gradient-to-br from-slate-500/80 via-slate-700/70 to-slate-600/60 text-white border-green-700",
	},
	{
		title: "Help Center",
		description: "Browse our comprehensive guides",
		icon: HelpCircle,
		contact: "Self-service portal",
		availability: "24/7",
		color: "bg-gradient-to-br from-slate-500/80 via-slate-700/70 to-slate-600/60 text-white border-green-700",
	},
]

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
		category: "general",
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const subject = encodeURIComponent(formData.subject)
		const body = encodeURIComponent(
			`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
		)	
		const mailtolink = `mailto:connectevoa@gmail.com?subject=${subject}&body=${body}`
		window.open(mailtolink,'_self')
		console.log("Form submitted:", formData)
	}

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	return (
		<div
			className="min-h-screen w-full py-12 px-4"
			style={{
				background:
					"linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%)",
			}}
		>
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
				<p className="text-lg text-blue-100">
					We're here to help you succeed. Reach out to our team anytime.
				</p>
			</div>

			{/* Main Container */}
			<div className="max-w-7xl mx-auto">
				{/* Main Split Section - Equal height columns */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-25 items-stretch">
					
					{/* Left Column - Contact Methods (2x2 Grid) */}
					<div className="flex flex-col justify-center">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-10 h-full">
							{contactMethods.map((method) => {
								const Icon = method.icon
								return (
									<Card
										key={method.title}
										className="hover:shadow-xl transition-all duration-200 group bg-[#1E202859] border border-[#8EC5FF66] backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(142,197,255,0.15)]  text-white flex flex-col"
									>
										<CardContent className="flex flex-col items-center justify-center p-6 rounded-xl bg-transparent h-full min-h-[240px]">
											<div className="text-center flex flex-col items-center justify-center h-full">
												<div
													className={`inline-flex h-12 w-12 items-center justify-center rounded-lg mb-3 ${method.color} shadow-md`}
												>
													<Icon className="h-6 w-6" />
												</div>
												{/* <h3 className="font-semibold text-white mb-2 text-lg">
													{method.title}
												</h3> */}
												<p className="text-sm text-blue-100 mb-3 text-center">
													{method.description}
												</p>
												<p className="text-sm font-medium text-white mb-2 text-center">
													{method.contact}
												</p>
												<Badge
													variant="outline"
													className="text-xs border-blue-400 text-blue-100 bg-transparent"
												>
													{method.availability}
												</Badge>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					</div>

					{/* Right Column - Contact Form */}
					<div className="flex flex-col justify-center">
						<Card className="bg-[#1E202859] border border-[#8EC5FF66] backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(142,197,255,0.15)] text-white h-full">
							<CardHeader>
								<CardTitle className="text-white text-2xl">Feedback Form</CardTitle>
								<CardDescription className="text-blue-100">
									Fill out the form below and we'll get back to you as soon as
									possible.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<label
												htmlFor="name"
												className="block text-sm font-medium text-blue-100 mb-2"
											>
												Name *
											</label>
											<Input
												id="name"
												name="name"
												type="text"
												required
												value={formData.name}
												onChange={handleInputChange}
												placeholder="Your full name"
												className="bg-[#1b1b2f] text-white border-blue-700 focus:border-blue-500 focus:ring-blue-500"
											/>
										</div>
										<div>
											<label
												htmlFor="email"
												className="block text-sm font-medium text-blue-100 mb-2"
											>
												Email *
											</label>
											<Input
												id="email"
												name="email"
												type="email"
												required
												value={formData.email}
												onChange={handleInputChange}
												placeholder="your@email.com"
												className="bg-[#1b1b2f] text-white border-blue-700 focus:border-blue-500 focus:ring-blue-500"
											/>
										</div>
									</div>
									<div>
										<label
											htmlFor="subject"
											className="block text-sm font-medium text-blue-100 mb-2"
										>
											Subject *
										</label>
										<Input
											id="subject"
											name="subject"
											type="text"
											required
											value={formData.subject}
											onChange={handleInputChange}
											placeholder="Brief description of your inquiry"
											className="bg-[#1b1b2f] text-white border-blue-700 focus:border-blue-500 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label
											htmlFor="message"
											className="block text-sm font-medium text-blue-100 mb-2"
										>
											Message *
										</label>
										<textarea
											id="message"
											name="message"
											required
											rows={6}
											value={formData.message}
											onChange={handleInputChange}
											placeholder="Please provide details about your inquiry..."
											className="w-full px-3 py-2 rounded-md bg-[#1b1b2f] text-white border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
										/>
									</div>
									<div className="text-center">
									<Button
										type="submit"
										className="w-fit bg-gradient-to-br from-slate-500/80 via-slate-700/70 to-slate-600/60 text-white border-green-700 text-white hover:from-blue-700 hover:to-blue-900 py-3 text-lg font-medium"
									>
										Send Message
									</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}