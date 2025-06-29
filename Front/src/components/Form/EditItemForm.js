import React, { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

// สร้าง state เก็บข้อมูลของ
const EditItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    name: "",
    category: "",
    place: "",
    date: "",
    description: "",
    locker: "",
    status: "",
    namereport: "",
    // เพิ่มฟิลด์ใหม่
    finderType: "",
    studentId: "",
    universityEmail: "",
    phoneNumber: ""
  });
  const [qrUrl, setQrUrl] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const categories = ["อุปกรณ์อิเล็กทรอนิกส์", "กระเป๋า", "เงินสด", "แว่นตา", "นาฬิกา", "กุญแจ", "เอกสาร", "แหวน/กำไล/ต่างหู", "เสื้อ", "หมวก", "รองเท้า"];

  const fetchImage = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/lost-items/${id}/image`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setImageUrl(imageUrl);
      //console.log("Image Loaded:", imageUrl);
    } catch (error) {
      //console.error("Error fetching image:", error);
    }
  }, [id]);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    axios.get(`http://localhost:8080/api/lost-items/${id}`)
      .then(response => {
        const data = response.data;
        const formattedDate = data.date ? data.date.split("T")[0] : "";
        setItem({ 
          ...data, 
          date: formattedDate,
          // ตั้งค่าเริ่มต้นสำหรับฟิลด์ใหม่ถ้าไม่มีข้อมูล
          finderType: data.finderType || "",
          studentId: data.studentId || "",
          universityEmail: data.universityEmail || "",
          phoneNumber: data.phoneNumber || ""
        });
        setQrUrl(`http://localhost:3000/remove/${id}`);
        //console.log("Data Fetched:", data);
        fetchImage();
      })
      .catch(error => console.error("Error fetching item data:", error));
  }, [id, fetchImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
    
    // ถ้าเปลี่ยนประเภทผู้พบ ให้รีเซ็ตฟิลด์ที่เกี่ยวข้อง
    if (name === "finderType") {
      setItem(prev => ({
        ...prev,
        [name]: value,
        studentId: value === "student" ? prev.studentId : "",
        universityEmail: value === "student" ? prev.universityEmail : ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedItem = { ...item };

    if (updatedItem.date) {
      updatedItem.date = new Date(updatedItem.date).toISOString().split(".")[0];
    }

    Object.keys(updatedItem).forEach(key => {
      if (updatedItem[key] === "" || updatedItem[key] === null) {
        delete updatedItem[key];
      }
    });

    console.log("Data Sent to Server:", updatedItem);
    try {
      await axios.put(`http://localhost:8080/api/lost-items/edit/${id}`, updatedItem, {
        headers: { "Content-Type": "application/json" },
      });
      alert("อัปเดตข้อมูลสำเร็จ!");
      navigate("/inventory");
    } catch (error) {
      //console.error("Error updating item:", error.response ? error.response.data : error);
      alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">แก้ไขข้อมูลของหาย - <span className="text-danger">กำลังแก้ไข</span></h2>
        <hr />

        <div className="row mt-4">
          <div className="col-md-4 text-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Lost Item"
                className="img-fluid rounded"
                style={{ maxHeight: "250px", objectFit: "cover" }}
              />
            ) : (
              <div className="border p-5">ไม่มีรูปภาพ</div>
            )}
          </div>

          <div className="col-md-8">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อสิ่งของ <span className="text-danger">*</span></label>
                  <input type="text" name="name" value={item.name} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ประเภท <span className="text-danger">*</span></label>
                  <select name="category" value={item.category} onChange={handleChange} required className="form-select">
                    <option value="">เลือกประเภท</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">วันที่พบ <span className="text-danger">*</span></label>
                  <input type="date" name="date" value={item.date} className="form-control" readOnly />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">ตู้เก็บ</label>
                  <input type="number" name="locker" value={item.locker} onChange={handleChange} className="form-control" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อผู้แจ้ง <span className="text-danger">*</span></label>
                  <input type="text" name="namereport" value={item.namereport} onChange={handleChange} required className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">สถานะ <span className="text-danger">*</span></label>
                  <input type="text" name="status" value={item.status} className="form-control" />
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">รายละเอียด <span className="text-danger">*</span></label>
                <textarea name="description" value={item.description} onChange={handleChange} required className="form-control" style={{ resize: 'none' }} />
              </div>

              {/* ส่วนข้อมูลผู้พบ */}
              <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-header">
                  <h6 className="mb-0">ข้อมูลผู้พบสิ่งของ</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ประเภทผู้พบ</label>
                      <select name="finderType" value={item.finderType} onChange={handleChange} className="form-select">
                        <option value="">เลือกประเภทผู้พบ</option>
                        <option value="student">นักศึกษา</option>
                        <option value="employee">พนักงาน</option>
                        <option value="outsider">บุคคลภายนอก</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input 
                        type="tel" 
                        name="phoneNumber" 
                        value={item.phoneNumber} 
                        onChange={handleChange} 
                        className="form-control"
                        placeholder="เช่น 081-234-5678"
                      />
                    </div>
                  </div>

                  {/* แสดงฟิลด์เพิ่มเติมสำหรับนักศึกษา */}
                  {item.finderType === "student" && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">เลขทะเบียนนักศึกษา</label>
                        <input 
                          type="text" 
                          name="studentId" 
                          value={item.studentId} 
                          onChange={handleChange} 
                          className="form-control"
                          placeholder="เช่น 64010123456"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">อีเมลมหาวิทยาลัย</label>
                        <input 
                          type="email" 
                          name="universityEmail" 
                          value={item.universityEmail} 
                          onChange={handleChange} 
                          className="form-control"
                          placeholder="เช่น student@university.ac.th"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-12 mb-3 text-center">
                <label className="form-label">คิวอาร์โค้ด</label>
                <div className="border p-3 rounded bg-light d-flex justify-content-center">
                  {qrUrl && (
                    <QRCodeCanvas
                      value={qrUrl}
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      includeMargin
                    />
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/inventory")}>ยกเลิก</button>
                <button type="submit" className="btn btn-warning">อัปเดต</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItemForm;