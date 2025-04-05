import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = "AIzaSyCPrH4D9ZCaECa1djVPhUzqIqP8lr9QIxI"; 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  }
};

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  // Get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      err => {
        console.warn("Location access denied.");
      }
    );
  }, []);

  // Fetch AI-generated medical advice
  useEffect(() => {
    const fetchFromGemini = async () => {
      try {
        setLoading(true);
        const formData = JSON.parse(decodeURIComponent(query));
        const genAI = new GoogleGenerativeAI(API_KEY);

        const medicalAdviceSchema = {
          description: "Medical advice based on user symptoms",
          type: SchemaType.OBJECT,
          properties: {
            condition: { type: SchemaType.STRING },
            table_name: { type: SchemaType.STRING },
            medicines: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  dosage: { type: SchemaType.STRING },
                  type: { type: SchemaType.STRING }
                },
                required: ["name", "dosage", "type"]
              }
            },
            advice: { type: SchemaType.STRING }
          },
          required: ["condition", "medicines", "advice"]
        };

        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: medicalAdviceSchema,
          }
        });

        const prompt = `
User Symptoms:
Symptoms: ${formData.symptoms}
Duration: ${formData.duration}
Conditions: ${formData.conditions}
Medications: ${formData.medications}
Allergies: ${formData.allergies}

Give condition, medicines (with dosage and type), and advice using the schema.
        `;

        const response = await model.generateContent(prompt);
        const data = JSON.parse(response.response.text());
        setResult(data);
      } catch (err) {
        setError(`Something went wrong: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchFromGemini();
  }, [query]);

  // Fetch nearby doctors
  useEffect(() => {
    if (!location) return;

    const fetchNearbyDoctors = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        const service = new window.google.maps.places.PlacesService(document.createElement("div"));

        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius: 5000,
          type: ["doctor"]
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setDoctors(results.slice(0, 5)); // Top 5
          }
        });
      };
      document.body.appendChild(script);
    };

    fetchNearbyDoctors();
  }, [location]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)"
      }}
    >
      <motion.div
        variants={cardVariants}
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "white",
          padding: "2.5rem",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}
      >
        <motion.h2 style={{ fontSize: "2.5rem", textAlign: "center", color: "#4338ca", marginBottom: "2rem" }}>
          Medical Analysis Results
        </motion.h2>

        {loading ? (
          <motion.div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "3rem" }}>
            <motion.div
              variants={loadingVariants}
              animate="animate"
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #4338ca",
                borderRadius: "50%"
              }}
            />
            <motion.p style={{ color: "#6b7280", fontSize: "1.1rem" }}>Analyzing your symptoms...</motion.p>
          </motion.div>
        ) : error ? (
          <div>{error}</div>
        ) : result ? (
          <>
            {/* Result cards */}
            <motion.div variants={cardVariants}>
              <h3 style={{ color: "#4338ca" }}>Likely Condition</h3>
              <p>{result.condition}</p>
              {result.table_name && <p><strong>Diagnostic Table:</strong> {result.table_name}</p>}
            </motion.div>

            <motion.div variants={cardVariants}>
              <h3 style={{ color: "#059669" }}>Recommended Medicines</h3>
              {result.medicines?.map((m, i) => (
                <div key={i}>
                  <p><strong>{m.name}</strong></p>
                  <p>Dosage: {m.dosage}</p>
                  <p>Type: {m.type}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={cardVariants}>
              <h3 style={{ color: "#d97706" }}>Important Advice</h3>
              <p>{result.advice}</p>
            </motion.div>

            {/* Nearby Doctors */}
            {doctors.length > 0 && (
              <motion.div variants={cardVariants}>
                <h3 style={{ color: "#2563eb", marginTop: "2rem" }}>Nearby Doctors</h3>
                {doctors.map((doc, i) => (
                  <div key={i} style={{ padding: "1rem", background: "#f9fafb", marginBottom: "1rem", borderRadius: "12px" }}>
                    <p><strong>{doc.name}</strong></p>
                    <p>{doc.vicinity}</p>
                    {doc.rating && <p>Rating: ⭐ {doc.rating}</p>}
                  </div>
                ))}
              </motion.div>
            )}

            <motion.div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#6b7280" }}>
              This is AI-generated advice. Always consult a licensed physician.
            </motion.div>
          </>
        ) : null}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          style={{
            marginTop: "2rem",
            width: "100%",
            padding: "1rem",
            background: "#4338ca",
            color: "white",
            borderRadius: "12px",
            border: "none",
            fontSize: "1.1rem"
          }}
        >
          Back to Symptom Checker
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
