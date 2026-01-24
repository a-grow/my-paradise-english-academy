const groupClasses = [
  { time: '6:00 PM - 6:50 PM', day: 'Tuesday', book: 'Book 4', isFull: false },
  { time: '7:00 PM - 7:50 PM', day: 'Tuesday', book: 'Book 3', isFull: false },
  { time: '8:00 PM - 8:50 PM', day: 'Tuesday', book: 'Book 2', isFull: false },
  { time: '7:00 PM - 7:50 PM', day: 'Friday', book: 'Book 1', isFull: false },
  { time: '8:30 PM - 9:20 PM', day: 'Friday', book: 'Book 5', isFull: false },
];

const ClassesSection = () => {
  return (
    <section id="classes" className="py-24 bg-white px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* TEACHER ANDY BIO */}
        <div className="mb-20 bg-[#f0fdf4] rounded-[40px] p-8 md:p-12 border-4 border-dashed border-[#86efac] flex flex-col md:flex-row items-center gap-10 shadow-lg">
          <div className="w-48 h-48 shrink-0 rounded-3xl border-8 border-white shadow-2xl overflow-hidden rotate-3 bg-slate-200">
             <img src="/andy.jpg" alt="Teacher Andy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=Teacher+Andy"; }} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Teacher Andy!</h2>
            <p className="text-lg text-slate-700 leading-relaxed italic">
              "Hello! My name is Teacher Andy. I believe learning should be an adventure! In my classroom, your child will find a fun, relaxing atmosphere where they can feel safe to express themselves and explore the English language through creativity. I’m here to make every lesson the highlight of their day!"
            </p>
            <p className="mt-6 font-bold text-[#0d9488] text-lg">
              🇺🇸 From USA • Bachelor's Degree • TEFL Certified • 20 Years Experience
            </p>
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 shadow-inner border border-slate-100">
           <h3 className="text-3xl font-bold text-slate-900 mb-2 text-center md:text-left">Group Classes</h3>
           <p className="text-[#fb7185] font-semibold mb-8 text-center md:text-left">(*All group classes use Oxford Discover books)</p>
           
           <div className="grid gap-4">
             {groupClasses.map((item, index) => (
               <div key={index} className="flex flex-col sm:flex-row justify-between items-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                 <div className="text-center sm:text-left">
                   <p className="text-xl font-bold text-slate-900">{item.day} <span className="text-sm font-normal text-[#0d9488] bg-[#ccfbf1] px-2 py-1 rounded ml-2">{item.book}</span></p>
                   <p className="text-slate-500">{item.time}</p>
                 </div>
                 <div className={`mt-4 sm:mt-0 px-6 py-2 rounded-full font-bold ${item.isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                   {item.isFull ? 'FULL' : 'AVAILABLE'}
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
};

export default ClassesSection;
