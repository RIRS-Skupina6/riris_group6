import Table from "react-bootstrap/Table";
import { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import {
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./InvoiceTable.css";
import axios from "axios";

const InvoiceTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const getInvoicesByPage = async (page: number) => {
    try {
      const response = await axios.get(`/api/db/all/${page}`);
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPages = async () => {
    try {
      const response = await axios.get("/api/db/pages");
      setTotalPages(response.data);
    } catch (error) {
      console.error("Error fetching page count:", error);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await axios.delete(`/api/db/delete/${id}`);
      refreshTable(currentPage);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedInvoice) {
      try {
        await axios.put(`/api/db/update/${selectedInvoice._id}`, selectedInvoice);
        setShowEditModal(false);
        refreshTable(currentPage);
      } catch (error) {
        console.error("Error updating invoice:", error);
        alert("Failed to update invoice.");
      }
    }
  };

  const refreshTable = async (page: number) => {
    await getInvoicesByPage(page);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refreshTable(page);
  };

  useEffect(() => {
    getTotalPages();
    refreshTable(1);
  }, []);

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Naziv</th>
            <th>Znesek</th>
            <th>Datum izdaje</th>
            <th>Rok plačila</th>
            <th>Plačnik</th>
            <th>Status</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={invoice._id}>
              <td>{(currentPage - 1) * 5 + index + 1}</td>
              <td>{invoice.name}</td>
              <td>{invoice.amount} €</td>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td
                className={
                  new Date(invoice.dueDate) > new Date(invoice.date)
                    ? "text-green"
                    : "text-red"
                }
              >
                {new Date(invoice.dueDate).toLocaleDateString()}
              </td>
              <td>{invoice.payer}</td>
              <td>
                <span
                  className={
                    invoice.statusSent ? "text-green" : "text-red"
                  }
                >
                  {invoice.statusSent ? "Poslano" : "Neposredovano"}
                </span>
                {" / "}
                <span
                  className={
                    invoice.statusPaid ? "text-green" : "text-red"
                  }
                >
                  {invoice.statusPaid ? "Plačano" : "Neplačano"}
                </span>
              </td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEdit(invoice)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteInvoice(invoice._id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Uredi račun</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Naziv</Form.Label>
              <Form.Control
                type="text"
                value={selectedInvoice?.name || ""}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formAmount">
              <Form.Label>Znesek</Form.Label>
              <Form.Control
                type="number"
                value={selectedInvoice?.amount || ""}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    amount: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formDate">
              <Form.Label>Datum izdaje</Form.Label>
              <Form.Control
                type="date"
                value={selectedInvoice?.date?.split("T")[0] || ""}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    date: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formDueDate">
              <Form.Label>Rok plačila</Form.Label>
              <Form.Control
                type="date"
                value={selectedInvoice?.dueDate?.split("T")[0] || ""}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    dueDate: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formPayer">
              <Form.Label>Plačnik</Form.Label>
              <Form.Control
                type="text"
                value={selectedInvoice?.payer || ""}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    payer: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formStatusSent">
              <Form.Check
                type="checkbox"
                label="Poslano"
                checked={selectedInvoice?.statusSent || false}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    statusSent: e.target.checked,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formStatusPaid">
              <Form.Check
                type="checkbox"
                label="Plačano"
                checked={selectedInvoice?.statusPaid || false}
                onChange={(e) =>
                  setSelectedInvoice({
                    ...selectedInvoice,
                    statusPaid: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Prekliči
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Shrani spremembe
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InvoiceTable;
