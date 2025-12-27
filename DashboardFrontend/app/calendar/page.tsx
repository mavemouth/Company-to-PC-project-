"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useUser } from "../../components/user-context";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "meeting" | "interview" | "visit" | "presentation";
  location: string;
  attendees: number;
  description: string;
  companyName?: string;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 25)); // September 25, 2025
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5001/api/hr/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const submissions = data.submissions || [];

        const calendarEvents: CalendarEvent[] = [];

        submissions.forEach((submission: any) => {
          submission.campusVisits?.forEach((visit: any, index: number) => {
            if (visit.startDate) {
              calendarEvents.push({
                id: `${submission._id}-${index}`,
                title: `${submission.companyName} Campus Visit`,
                date: new Date(visit.startDate).toISOString().split("T")[0],
                time: "10:00 AM",
                type: "visit",
                location: visit.location || "Campus",
                attendees: 5,
                description: `Campus visit for ${
                  submission.jobDescriptions[0]?.title || "hiring"
                }`,
                companyName: submission.companyName,
              });
            }
          });
        });

        const defaultEvents: CalendarEvent[] = [
          {
            id: "default-1",
            title: "HR Meeting",
            date: "2025-09-25",
            time: "11:00 AM",
            type: "meeting",
            location: "HR Office",
            attendees: 5,
            description: "Weekly HR team sync meeting",
          },
        ];

        setEvents([...calendarEvents, ...defaultEvents]);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-green-100 text-green-700";
      case "visit":
        return "bg-blue-100 text-blue-700";
      case "interview":
        return "bg-purple-100 text-purple-700";
      case "presentation":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View your free and busy dates</p>
        </div>
        <div className="animate-pulse grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-200 h-96 rounded-lg"></div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View your free and busy dates</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <CardTitle>
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Click on any date to view events
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    i + 1
                  );
                  const dateEvents = getEventsForDate(date);
                  const isSelected =
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString();
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i + 1}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 text-center cursor-pointer rounded-lg transition-colors min-h-[60px] ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isToday
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-sm font-medium">{i + 1}</div>
                      {dateEvents.length > 0 && (
                        <div className="mt-1">
                          <div
                            className={`w-2 h-2 rounded-full mx-auto ${
                              isSelected ? "bg-white" : "bg-blue-600"
                            }`}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle className="text-lg">
                  Events on {formatDate(selectedDate).split(",")[1]}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No events scheduled for this date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {event.title}
                          </h4>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <Badge className={`mb-3 ${getTypeColor(event.type)}`}>
                          {event.type.charAt(0).toUpperCase() +
                            event.type.slice(1)}
                        </Badge>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-3">
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
