import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function Contact({ listing }) {
  const [landLord, setLandLord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandLord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch, status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success === false) {
          toast.error("Could not fetch landlord");
          return;
        }
        setLandLord(data);
      } catch (error) {
        console.error("Error fetching landlord:", error);
        toast.error("Something went wrong");
      }
    };
    fetchLandLord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value)
  }

  return (
    <>
      {landLord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landLord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>
          <a
            href={`mailto:${landLord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:bg-slate-800 transition-all duration-150"
          >
            Send Message
          </a>
        </div>
      )}
    </>
  );
}

export default Contact;
