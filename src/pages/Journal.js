import { useState, useEffect } from "react";
import spendingCategoriesJson from "../data/spending-category.json";

function Journal() {
  const [records, setRecords] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form states
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem("spendingData")) || [];
    setRecords(savedRecords);

    const savedCustomCats = JSON.parse(localStorage.getItem("customCategories")) || [];
    setCustomCategories(savedCustomCats);

    const combined = [
      ...spendingCategoriesJson.map((c) => c.category),
      ...savedCustomCats,
    ];
    setCategories(combined);
  }, []);

  const handleAddRecord = (e) => {
    e.preventDefault();

    let finalCategory = category;
    if (category === "Others") {
      if (!otherCategory.trim()) {
        alert("Please enter a category name for Others");
        return;
      }
      finalCategory = otherCategory.trim();

      if (!categories.includes(finalCategory)) {
        const updatedCustomCats = [...customCategories, finalCategory];
        setCustomCategories(updatedCustomCats);
        localStorage.setItem("customCategories", JSON.stringify(updatedCustomCats));
        setCategories([...categories, finalCategory]);
      }
    }

    if (!date || !finalCategory || !amount) {
      alert("Please fill all required fields");
      return;
    }

    const newRecord = {
      date,
      category: finalCategory,
      amount: parseFloat(amount),
    };
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("spendingData", JSON.stringify(updatedRecords));

    // Clear form
    setDate("");
    setCategory("");
    setOtherCategory("");
    setAmount("");
  };

  return (
    <div className="mt-4">
      <h2 className="mb-4">Add Spending Record</h2>

      <form onSubmit={handleAddRecord} className="mb-5">
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Others">Others</option>
          </select>
        </div>

        {category === "Others" && (
          <div className="mb-3">
            <label className="form-label">New Category Name</label>
            <input
              type="text"
              className="form-control"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Amount</label>
          <input
            type="number"
            className="form-control"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100.00"
            required
          />
        </div>

        <button type="submit" className="btn btn-info text-white">
          Add Record
        </button>
      </form>

      <h3>Saved Spending Records</h3>
      {records.length === 0 ? (
        <p className="text-muted">No spending records yet.</p>
      ) : (
        <ul className="list-group">
          {records.map((r, i) => (
            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{r.date}</strong> — {r.category}
              </div>
              <span className="badge bg-info text-white">${r.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Journal;
