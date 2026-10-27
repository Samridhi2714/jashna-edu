import TestimonialsHero from "../sections/testimonials/TestimonialsHero";
import RecentAdmissions from "../sections/testimonials/RecentAdmissions";
import Activity from "../sections/testimonials/Activity";
function Testimonials() {
  return (
    <div className="min-h-screen bg-jashna-ivory text-jashna-charcoal">
      {" "}
      <TestimonialsHero />
       <RecentAdmissions /> 
       <Activity />{" "}
    </div>
  );
}
export default Testimonials;
