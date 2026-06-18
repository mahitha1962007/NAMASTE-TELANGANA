export default function FormInput({ label, id, type = 'text', value, onChange, placeholder, required = false, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all duration-200
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all duration-200
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          {...props}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
