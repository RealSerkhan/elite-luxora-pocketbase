class Property {
    constructor({
      id,
      title,
      description,
      price,
      currency,
      bedrooms,
      bathrooms,
      area,
      location = { address_name: "", lat: 0, lon: 0 },
      city,
      country,
      images = [],
      isFurnished,
      amenities = [],
      propertyType,
      postedDate,
      isFeatured,
      ownerId,
      projectId,
      developerId,
      paymentPlan = {
        down_payment: 0,
        during_construction: 0,
        on_handover: 0,
      },
    }) {
      this.id = id || null;
      this.title = title || "";
      this.description = description || "";
      this.price = price || 0;
      this.currency = currency || "USD";
      this.bedrooms = bedrooms || 0;
      this.bathrooms = bathrooms || 0;
      this.area = area || 0;
      this.location = {
        address_name: location.address_name || "",
        lat: location.lat || 0,
        lon: location.lon || 0,
      };
      this.city = city || "";
      this.country = country || "";
      this.images = images;
      this.isFurnished = !!isFurnished;
      this.amenities = amenities;
      this.propertyType = propertyType || "Apartment";
      // Handle Firestore Timestamp or normal Date
      if (postedDate instanceof Object && typeof postedDate.toDate === "function") {
        this.postedDate = postedDate.toDate();
      } else if (postedDate) {
        this.postedDate = new Date(postedDate);
      } else {
        this.postedDate = new Date();
      }
      this.isFeatured = !!isFeatured;
      this.ownerId = ownerId || "";
      this.projectId = projectId || "";
      this.developerId = developerId || "";
      this.paymentPlan = {
        down_payment: paymentPlan.down_payment,
        during_construction: paymentPlan.during_construction,
        on_handover: paymentPlan.on_handover,
      };
    }
  
    static fromFirestore(doc) {
      const data = doc.data();
      return new Property({
        id: doc.id,
        ...data,
        postedDate: data.postedDate,
      });
    }
  
    toFirestore() {
      return {
        title: this.title,
        description: this.description,
        price: this.price,
        currency: this.currency,
        bedrooms: this.bedrooms,
        bathrooms: this.bathrooms,
        area: this.area,
        location: this.location,
        city: this.city,
        country: this.country,
        images: this.images,
        isFurnished: this.isFurnished,
        amenities: this.amenities,
        propertyType: this.propertyType,
        postedDate: this.postedDate,
        isFeatured: this.isFeatured,
        ownerId: this.ownerId,
        projectId: this.projectId,
        developerId: this.developerId,
        paymentPlan: this.paymentPlan,
      };
    }
  }
  
  module.exports = Property;